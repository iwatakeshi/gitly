export type Task<T> = () => Promise<T>

/**
 * Executes a task in a sequence
 * @param tasks The tasks to execute
 */
export async function execute<T>(
  tasks: Task<T>[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const next = () => execute(tasks.slice(1)).then(resolve)
    return tasks[0]()
      .then((t) => {
        return (t ? resolve(t) : next())
      })
      .catch(reject)
  })
}
