export function withTimeout<T>(promise: PromiseLike<T>, ms = 8000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error("数据库请求超时，请刷新后重试。")), ms);
    })
  ]).finally(() => clearTimeout(timer));
}
