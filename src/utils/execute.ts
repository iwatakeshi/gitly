export type Task = () => Promise<string | boolean>

/**
 * Execute tasks sequentially until one succeeds or all fail
 * @param tasks Array of async tasks to execute
 * @returns Result from first successful task, or false if all fail
 */
export default async function execute(
  tasks: Task[]
): Promise<string | boolean> {
  let lastError: unknown
  for (const task of tasks) {
    try {
      const result = await task()
      if (result) {
        return result
      }
    } catch (error) {
      // Store error and continue to next task
      lastError = error
      continue
    }
  }
  // If we had an error on the last task, throw it
  if (lastError !== undefined) {
    throw lastError
  }
  return false
}
