// Packages
import { Container } from 'inversify';
import { bindings } from './inversify';
import { buildProviderModule } from 'inversify-binding-decorators';

export default async function initContainer(): Promise<Container> {

    const container = new Container();
    await container.loadAsync(bindings);

    // Reflects all decorators provided by this package and packages them into 
    // a module to be loaded by the container
    container.load(buildProviderModule());

    return container;
}
