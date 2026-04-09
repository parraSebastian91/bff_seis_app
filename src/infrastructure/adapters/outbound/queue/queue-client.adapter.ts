/*
https://docs.nestjs.com/providers#services
*/

import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IMessagePublisher } from './../../../../core/domain/ports/outbound/message.publisher.interface';

@Injectable()
export class QueueClientAdapter implements IMessagePublisher, OnModuleInit, OnModuleDestroy {

	constructor(@Inject('OBJECT_SERVICE') private readonly client: ClientProxy) { }

	async onModuleInit(): Promise<void> {
		await this.client.connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.client.close();
	}

	async publish(pattern: string, payload: unknown): Promise<void> {
		await firstValueFrom(this.client.emit(pattern, payload));
	}
}