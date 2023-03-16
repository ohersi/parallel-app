import { Container, ContainerModule } from "inversify"

export type Constr<T> = new () => T

export function createTestingModule(...modules: Constr<ContainerModule>[]) {
  const container = new Container()

  container.load(...modules.map((m) => new m()));
  // Unbind all bindings from containers
  container.unbindAll();

  return container;
}