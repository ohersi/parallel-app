// Packages
import { ContainerModule } from "inversify";
// Imports
import UserService from "../../services/user.service";

export class UserModule extends ContainerModule {
    public constructor() {
        super((bind) => {
            bind(UserService).toSelf();
        })
    }
}