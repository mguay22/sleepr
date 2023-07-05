import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { Reservation } from './models/reservation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ReservationsRepository extends AbstractRepository<Reservation> {
  protected readonly logger = new Logger(ReservationsRepository.name);

  constructor(
    @InjectRepository(Reservation)
    itemsRepository: Repository<Reservation>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
