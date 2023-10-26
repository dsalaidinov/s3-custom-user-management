import { Request, Response } from 'express';
import Resource, { IResource } from '../models/resource';

export const createResource = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const resource: IResource = new Resource({ name, type });
    await resource.save();
    return res.status(201).json(resource);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create resource' });
  }
};

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find();
    return res.status(200).json(resources);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch resources' });
  }
};
