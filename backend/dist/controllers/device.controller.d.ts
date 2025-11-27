import { Request, Response } from 'express';
import { PaginationQuery, DateRangeQuery } from '../types/index.js';
export declare const saveDeviceReading: (req: Request, res: Response) => Promise<void>;
export declare const getDeviceReadings: (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => Promise<void>;
export declare const getDeviceReadingsByDateRange: (req: Request<{}, {}, {}, DateRangeQuery>, res: Response) => Promise<void>;
export declare const saveEnergyReadingController: (req: Request, res: Response) => Promise<void>;
export declare const getEnergyReadingsController: (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => Promise<void>;
export declare const getEnergyReadingsByDateRangeController: (req: Request<{}, {}, {}, DateRangeQuery>, res: Response) => Promise<void>;
export declare const getLatestEnergyReading: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=device.controller.d.ts.map