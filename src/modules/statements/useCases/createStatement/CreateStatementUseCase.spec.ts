import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        statementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(
            usersRepository,
            statementsRepository
        );
    });

    async function createUser(name?: string): Promise<any> {
        const user = await usersRepository.create({
            name: name ? name : "test",
            email: "test@test.com",
            password: "1234",
        })

        return user;
    }

    async function createStatement(user: any, amount: number, type: OperationType): Promise<any> {
        const response = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: type,
            amount: amount,
            description: "test",
        })

        return response;
    }

    it("should be able to create a deposit statement", async () => {
        
        const user = await createUser();
        const response = await createStatement(user, 100, OperationType.DEPOSIT);
        expect(response).toHaveProperty("id");

    });

    it("should be able to create a withdraw statement", async () => {
        
        const user = await createUser();
        await createStatement(user, 100, OperationType.DEPOSIT);
        const response = await createStatement(user, 100, OperationType.WITHDRAW);
        expect(response).toHaveProperty("id");

    });

    it("should not be able to create a withdraw statement without sufficient funds", async () => {
        
        expect(async () => {
            const user = await createUser();
            await createStatement(user, 50, OperationType.DEPOSIT);
            await createStatement(user, 100, OperationType.WITHDRAW);
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);

    });

    it("should not be able to create a statement from a non-existent user", async () => {
        
        expect(async () => {
            await createStatement("test", 50, OperationType.DEPOSIT);
            await createStatement("test", 100, OperationType.WITHDRAW);
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);

    });
});