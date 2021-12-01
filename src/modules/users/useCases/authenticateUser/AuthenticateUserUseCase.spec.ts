import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

    beforeEach(() => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(
            inMemoryUserRepository
        );
        createUserUseCase = new CreateUserUseCase(
            inMemoryUserRepository
        );
    });

    async function createUser(): Promise<ICreateUserDTO> {
        const user: ICreateUserDTO = {
            name: "Felipe",
            email: "felps@gmail.com",
            password: "potato123"
        }
        await createUserUseCase.execute(user);
        return user;
    }

    it("should be able to authenticate a user", async () => {
        const user: ICreateUserDTO = await createUser();

        const result = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password,
        });

        expect(result).toHaveProperty("token");
    });

    it("should not be able to authenticate a non-existent user", async () => {
        expect(async () => {

            await authenticateUserUseCase.execute({
                email: "non@existe.com",
                password: "1234"
            });

        }).rejects.toBeInstanceOf(AppError);
    });

    it("should not be able to authenticate a user with incorrect password", async () => {
        expect(async () => {
            const user: ICreateUserDTO = await createUser();

            await authenticateUserUseCase.execute({
                email: user.email,
                password: "1234"
            });

        }).rejects.toBeInstanceOf(AppError);
    });
})