import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepository);
    });

    async function createUser(name?: string): Promise<any> {
        const user = await createUserUseCase.execute({
            name: name ? name : "test",
            email: "test@test.com",
            password: "1234",
        })

        return user;
    }

    it("should be able to create a user", async () => {
        
        const user = await createUser();

        expect(user).toHaveProperty("id");

    });

    it("should not be able to create a existent user", async () => {
        expect(async () =>{
            await createUser("user1");
            await createUser("user2");
        }).rejects.toBeInstanceOf(CreateUserError);
    });
})