import { CircleModel, ICircle } from '../../models/circle.model';

export class CircleService {
  async findAll(limit: number = 20, offset: number = 0): Promise<ICircle[]> {
    return CircleModel.find()
      .skip(offset)
      .limit(limit)
      .sort({ subscribers: -1 }) // Sort by popularity
      .exec();
  }

  async findById(id: string): Promise<ICircle | null> {
    return CircleModel.findById(id).exec();
  }

  async create(data: Partial<ICircle>): Promise<ICircle> {
    const circle = new CircleModel(data);
    return circle.save();
  }

  async joinCircle(circleId: string, userId: string): Promise<ICircle | null> {
    return CircleModel.findByIdAndUpdate(
      circleId,
      { $addToSet: { subscribers: userId } },
      { new: true }
    ).exec();
  }

  async leaveCircle(circleId: string, userId: string): Promise<ICircle | null> {
    return CircleModel.findByIdAndUpdate(
      circleId,
      { $pull: { subscribers: userId } },
      { new: true }
    ).exec();
  }

  async getMyCircles(userId: string): Promise<ICircle[]> {
    return CircleModel.find({ subscribers: userId }).exec();
  }
}
