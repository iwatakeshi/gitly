export type Task = () => Promise<string | boolean>

/**
 * Execute tasks sequentially until one succeeds or all fail
 * @param tasks Array of async tasks to execute
 * @returns Result from first successful task, or false if all fail
 * @throws {AggregateError} When all tasks fail, contains all errors
 */
export default async function execute(
  tasks: Task[]
): Promise<string | boolean> {
  const errors: Error[] = []
  
  for (const task of tasks) {
    try {
      const result = await task()
      if (result) {
        return result
      }
    } catch (error) {
      // Store error and continue to next task
      errors.push(error instanceof Error ? error : new Error(String(error)))
      continue
    }
  }
  
  // If we collected errors, throw them as an aggregate
  if (errors.length > 0) {
    throw new AggregateError(errors, `All tasks failed (${errors.length} attempts)`)
  }
  return false
}
