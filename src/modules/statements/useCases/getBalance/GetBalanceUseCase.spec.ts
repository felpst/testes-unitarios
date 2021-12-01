import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        statementsRepository = new InMemoryStatementsRepository();
        getBalanceUseCase = new GetBalanceUseCase(
            statementsRepository,
            usersRepository,
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
        const response = await statementsRepository.create({
            user_id: user.id as string,
            type: type,
            amount: amount,
            description: "test",
        })

        return response;
    }

    it("should be able to get a balance", async () => {

        const user = await createUser();
        const deposit = await createStatement(user, 100, OperationType.DEPOSIT);
        const withdraw = await createStatement(user, 50, OperationType.WITHDRAW);

        const response = await getBalanceUseCase.execute({
            user_id: user.id as string,
        });

        expect(response).toStrictEqual({
            statement: [deposit, withdraw],
            balance: 50,
        });

    });

    it("should not be able to get a balance from a non-existent user", async () => {
        expect(async () => {
            await createStatement("test", 100, OperationType.DEPOSIT);
            await getBalanceUseCase.execute({
                user_id: "test",
            });
        }).rejects.toBeInstanceOf(GetBalanceError);
    });

});