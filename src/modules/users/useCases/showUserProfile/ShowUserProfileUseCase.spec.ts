import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show user profile", () => {
    
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    });

    async function createUser(name?: string): Promise<any> {
        const user = await usersRepository.create({
            name: name ? name : "test",
            email: "test@test.com",
            password: "1234",
        })

        return user;
    }

    it("should be able to show a user", async () => {
        
        const user = await createUser();
        const response = await showUserProfileUseCase.execute(user.id as string);
        expect(response).toBe(user);

    });

    it("should not be able to show a non-existent user", async () => {

        expect(async () => {
            await showUserProfileUseCase.execute("non-existent-user");
        }).rejects.toBeInstanceOf(ShowUserProfileError);

    });
});