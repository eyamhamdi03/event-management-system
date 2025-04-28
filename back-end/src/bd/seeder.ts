import { randEmail, randFullName, randPassword, randPhoneNumber, randPastDate, randUuid, randWord, randFutureDate, randStreetAddress, randBoolean, randNumber } from '@ngneat/falso';
import { DataSource } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { Event } from '../event/entities/event.entity';
import { Registration } from '../registration/entities/registration.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../auth/roles.enum';
import { SocialProvider } from '../auth/socialProviders.enum';
import * as bcrypt from 'bcrypt';
export class Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    await this.dataSource.synchronize(true); // WARNING: This will drop all tables!

    // Seed categories
    const categories = await this.seedCategories();
    
    // Seed users
    const users = await this.seedUsers();
    
    // Seed events
    const events = await this.seedEvents(categories, users);
    
    // Seed registrations
    await this.seedRegistrations(users, events);

    console.log('Database seeded successfully!');
  }

  private async seedCategories(): Promise<Category[]> {
    const categories = [
      { name: 'Music' },
      { name: 'Sports' },
      { name: 'Technology' },
      { name: 'Business' },
      { name: 'Food & Drink' },
      { name: 'Arts' },
      { name: 'Education' },
      { name: 'Health' },
    ];

    const categoryEntities = await this.dataSource.getRepository(Category).save(categories);
    console.log(`Seeded ${categoryEntities.length} categories`);
    return categoryEntities;
  }

  private async seedUsers(): Promise<User[]> {
    const userRepository = this.dataSource.getRepository(User);
    


    const saltRounds = 10;
    
    // Create admin
    const adminPassword = 'admin123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    const admin = userRepository.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      phone: parseInt(randPhoneNumber().replace(/\D/g, '').substring(0, 8)),
      birthDate: randPastDate(),
      role: Role.Admin,
      emailVerified: true,
      provider: SocialProvider.Local,
    });
    
    // Create organizer
    const organizerPassword = 'organizer123';
    const hashedOrganizerPassword = await bcrypt.hash(organizerPassword, saltRounds);
    
    const organizer = userRepository.create({
      fullName: 'Event Organizer',
      email: 'organizer@example.com',
      password: hashedOrganizerPassword,
      phone: parseInt(randPhoneNumber().replace(/\D/g, '').substring(0, 8)),
      birthDate: randPastDate(),
      role: Role.Organizer,
      emailVerified: true,
      provider: SocialProvider.Local,
    });
    
    // Create regular users
    const regularUsers = await Promise.all(
      Array.from({ length: 10 }).map(async () => {
        const user = new User();
        user.fullName = randFullName();
        user.email = randEmail();
        const plainPassword = randPassword()[0];
        user.password = await bcrypt.hash(plainPassword, saltRounds);
        user.phone = parseInt(randPhoneNumber().replace(/\D/g, '').substring(0, 8));
        user.birthDate = randPastDate();
        user.role = Role.User;
        user.emailVerified = randBoolean();
        user.provider = Math.random() > 0.5 ? SocialProvider.Local : SocialProvider.Google;
    
        // Optional: Log to keep track of passwords if needed for testing
        console.log(`User ${user.fullName} → ${user.email} → password: ${plainPassword}`);
    
        return user;
      })
    );

    const allUsers = [admin, organizer, ...regularUsers];
    const savedUsers = await userRepository.save(allUsers);
    console.log(`Seeded ${savedUsers.length} users`);
    return savedUsers;
}

private async seedEvents(categories: Category[], users: User[]): Promise<Event[]> {
  const eventRepository = this.dataSource.getRepository(Event);
  const organizers = users.filter(user => user.role === Role.Organizer);

  const events = Array.from({ length: 20 }, () => {
      const randomCategory = categories[randNumber({ min: 0, max: categories.length - 1 })];
      const randomOrganizer = organizers[randNumber({ min: 0, max: organizers.length - 1 })];

      return eventRepository.create({
          title: `${randWord()} Event`,
          description: `This is a ${randomCategory.name} event about ${randWord()} and ${randWord()}.`,
          eventDate: randFutureDate(),
          location: randStreetAddress(),
          host: randomOrganizer,
          category: randomCategory,
          validated: Math.random() > 0.33 // Approx 2/3 of events are validated
      });
  });

  const savedEvents = await eventRepository.save(events);
  console.log(`Seeded ${savedEvents.length} events`);
  return savedEvents;
}

private async seedRegistrations(users: User[], events: Event[]): Promise<void> {
  const registrationRepository = this.dataSource.getRepository(Registration);
  const regularUsers = users.filter(user => user.role === Role.User);
  const registrations: Registration[] = [];

  for (const event of events) {
      // Each event gets 1-5 random registrations
      const numRegistrations = randNumber({ min: 1, max: 5 });
      const shuffledUsers = [...regularUsers].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numRegistrations && i < shuffledUsers.length; i++) {
          registrations.push(registrationRepository.create({
              user: shuffledUsers[i],
              event: event,
              confirmed: randBoolean()
          }));
      }
  }

  const savedRegistrations = await registrationRepository.save(registrations);
  console.log(`Seeded ${savedRegistrations.length} registrations`);
}
}
