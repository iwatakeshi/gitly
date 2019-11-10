export type Task = () => Promise<string | boolean>

export default async function execute(tasks: Task[]): Promise<string | boolean> {
  return new Promise((resolve, reject) => {
    const next = () => execute(tasks.slice(1)).then(resolve)
    return tasks[0]()
      .then(t => t ? resolve(t) : next())
      .catch(reject)
  })
}
