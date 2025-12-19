// src/app/core/models/notification.model.ts

export interface AppNotification {
  id?: string;
  message: string;
  dateEnvoi: Date;
  statutLecture: boolean;
  typeNotification: string;
  citoyenId?: string;
  technicienId?: string;
  interventionId?: string;
  dateCreation: Date;
}