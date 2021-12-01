import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("GetStatementOperation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
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
        const response = await statementsRepository.create({
            user_id: user.id as string,
            type: type,
            amount: amount,
            description: "test",
        })

        return response;
    }

  it("should be able to get the statement operation", async () => {
    const user = await createUser();

    const statement = await createStatement(user, 100, OperationType.DEPOSIT);

    const response = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: user.id as string,
    });

    expect(response).toBe(statement);
  });

  it("should not be able to get the statement operation from a non-existent user", async () => {
    expect(async () => {
      const statement = await createStatement("test", 100, OperationType.DEPOSIT);

      await getStatementOperationUseCase.execute({
        statement_id: statement.id as string,
        user_id: "test",
      });

    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a non-existent statement operation", async () => {
    expect(async () => {
      const user = await createUser();

      await getStatementOperationUseCase.execute({
        statement_id: "test",
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});