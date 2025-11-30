export type Task = () => Promise<string | boolean>

export default async function execute(
  tasks: Task[]
): Promise<string | boolean> {
  return new Promise((resolve, reject) => {
    const task = tasks[0]
    if (!task) {
      resolve(false)
      return
    }
    const next = () => execute(tasks.slice(1)).then(resolve)
    return task()
      .then((t) => (t ? resolve(t) : next()))
      .catch(reject)
  })
}
