import { readFile, unlink, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { exists } from 'node:fs'
import { promisify } from 'node:util'
import type GitlyOptions from '../interfaces/options'
import gitly from './gitly'

const existsAsync = promisify(exists)

/**
 * Action types supported in gitly.json / degit.json
 */
export type ActionType = 'clone' | 'remove'

/**
 * Base action interface
 * Follows Interface Segregation Principle
 */
export interface IAction {
  action: ActionType
}

/**
 * Clone action - downloads another repository
 */
export interface CloneAction extends IAction {
  action: 'clone'
  src: string
  dest?: string
}

/**
 * Remove action - deletes files or directories
 */
export interface RemoveAction extends IAction {
  action: 'remove'
  files: string[]
}

/**
 * Union type of all actions
 */
export type Action = CloneAction | RemoveAction

/**
 * Actions configuration file schema
 */
export interface ActionsConfig {
  actions?: Action[]
}

/**
 * Strategy interface for executing actions
 * Follows Strategy pattern and Command pattern
 */
export interface IActionExecutor {
  execute(action: Action, workingDir: string, options: GitlyOptions): Promise<void>
}

/**
 * Executor for clone actions
 * Follows Single Responsibility Principle
 */
export class CloneActionExecutor implements IActionExecutor {
  async execute(
    action: Action,
    workingDir: string,
    options: GitlyOptions
  ): Promise<void> {
    if (action.action !== 'clone') {
      throw new Error(`Invalid action type: ${action.action}`)
    }

    const cloneAction = action as CloneAction
    const destination = cloneAction.dest
      ? resolve(workingDir, cloneAction.dest)
      : workingDir

    // Recursively clone and execute actions in the new repository
    await gitly(cloneAction.src, destination, options)
    await ActionsProcessor.processDirectory(destination, options)
  }
}

/**
 * Executor for remove actions
 * Follows Single Responsibility Principle
 */
export class RemoveActionExecutor implements IActionExecutor {
  async execute(
    action: Action,
    workingDir: string,
    _options: GitlyOptions
  ): Promise<void> {
    if (action.action !== 'remove') {
      throw new Error(`Invalid action type: ${action.action}`)
    }

    const removeAction = action as RemoveAction
    const errors: Error[] = []

    for (const file of removeAction.files) {
      const filePath = resolve(workingDir, file)
      try {
        // Attempt to remove file or directory
        await rm(filePath, { recursive: true, force: true })
      } catch (error) {
        errors.push(
          error instanceof Error ? error : new Error(String(error))
        )
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Failed to remove ${errors.length} file(s)`
      )
    }
  }
}

/**
 * Factory for creating action executors
 * Follows Factory pattern
 */
export class ActionExecutorFactory {
  private static executors = new Map<ActionType, IActionExecutor>([
    ['clone', new CloneActionExecutor()],
    ['remove', new RemoveActionExecutor()],
  ])

  static getExecutor(actionType: ActionType): IActionExecutor {
    const executor = this.executors.get(actionType)
    if (!executor) {
      throw new Error(`Unknown action type: ${actionType}`)
    }
    return executor
  }
}

/**
 * Main actions processor
 * Follows Facade pattern to simplify the actions system
 */
export class ActionsProcessor {
  private static readonly CONFIG_FILENAMES = ['gitly.json', 'degit.json']

  /**
   * Process actions in a directory if config file exists
   */
  static async processDirectory(
    directory: string,
    options: GitlyOptions
  ): Promise<void> {
    const config = await this.loadConfig(directory)
    if (!config || !config.actions || config.actions.length === 0) {
      return
    }

    await this.executeActions(config.actions, directory, options)
  }

  /**
   * Load configuration from gitly.json or degit.json
   */
  private static async loadConfig(
    directory: string
  ): Promise<ActionsConfig | null> {
    for (const filename of this.CONFIG_FILENAMES) {
      const configPath = join(directory, filename)
      try {
        if (await existsAsync(configPath)) {
          const content = await readFile(configPath, 'utf-8')
          const config = JSON.parse(content) as ActionsConfig
          
          // Remove config file after reading (degit behavior)
          await unlink(configPath).catch(() => {
            // Ignore errors if file is already deleted
          })
          
          return config
        }
      } catch (error) {
        // Invalid JSON or read error - skip this config file
        console.warn(`Failed to load ${filename}:`, error)
      }
    }
    return null
  }

  /**
   * Execute all actions sequentially
   */
  private static async executeActions(
    actions: Action[],
    workingDir: string,
    options: GitlyOptions
  ): Promise<void> {
    const errors: Error[] = []

    for (const action of actions) {
      try {
        const executor = ActionExecutorFactory.getExecutor(action.action)
        await executor.execute(action, workingDir, options)
      } catch (error) {
        errors.push(
          error instanceof Error ? error : new Error(String(error))
        )
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Failed to execute ${errors.length} action(s)`
      )
    }
  }
}
