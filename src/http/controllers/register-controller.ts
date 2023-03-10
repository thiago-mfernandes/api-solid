import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { RegisterUseCase } from "@/use-cases/register-use-case";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists-error";

export async function register (request: FastifyRequest, reply: FastifyReply) {
  /**
   * SECTION schema de validacao
   * NOTE se a validacao falhar, lanca um erro e nao executa o codigo abaixo
   */
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, name, password } = registerBodySchema.parse(request.body);

  try {

    /**
     * SECTION Funcionamento do Controller :
     * NOTE Valida os dados recebidos na requisição;
     * NOTE Possui a responsabilidade de instanciar o Repositório e o UseCase;
     * NOTE Repassa a responsabilidade de manipular os dados para o UseCase;
     * NOTE Retorna uma Resposta;
     */

    const usersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);

    await registerUseCase.execute({
      name, 
      email, 
      password,
    });
  } catch (error) {
    if(error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    
    throw error;
  }

  return reply.status(201).send()
}