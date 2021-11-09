export type Task<T> = () => Promise<T>

export async function execute<T>(
  tasks: Task<T>[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const next = () => execute(tasks.slice(1)).then(resolve)
    return tasks[0]()
      .then((t) => {
        // if (Array.isArray(t)) {
        //   if (tasks?.length === 1 && !head(t)) {
        //     return reject(t)
        //   }
        //   return head(t) ? resolve(t) : next()
        // } else
        return (t ? resolve(t) : next())
      })
      .catch(reject)
  })
}
