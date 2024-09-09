import factory from '@adonisjs/lucid/factories'
import Employee from '#models/employee'

export const EmployeeFactory = factory
  .define(Employee, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
      city: faker.location.city(),
      position: faker.person.jobTitle(),
      salary: faker.number.int({ min: 2000, max: 15000 }),
    }
  })
  .build()
