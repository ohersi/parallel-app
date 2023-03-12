// Packages
import { Container } from 'inversify';
import { bindings } from './inversify';
import { buildProviderModule } from 'inversify-binding-decorators';

export default async function initContainer(): Promise<Container> {

    const container = new Container();
    await container.loadAsync(bindings);
    container.load(buildProviderModule());

    return container;
}
