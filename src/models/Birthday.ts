import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

interface BirthdayAttributes {
  id: number;
  userId: string;
  guildId: string;
  username: string;
  day: number;
  month: number;
  year?: number;
  time_exec: Date;
  time_import: Date;
}

interface BirthdayCreationAttributes extends Optional<BirthdayAttributes, 'id' | 'time_exec' | 'time_import'> {}

export class Birthday extends Model<BirthdayAttributes, BirthdayCreationAttributes> implements BirthdayAttributes {
  public id!: number;
  public userId!: string;
  public guildId!: string;
  public username!: string;
  public day!: number;
  public month!: number;
  public year?: number;
  public time_exec!: Date;
  public time_import!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Birthday.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 31,
      },
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1900,
        max: new Date().getFullYear(),
      },
    },
    time_exec: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    time_import: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'birthdays',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'guildId'],
      },
      {
        fields: ['guildId', 'month', 'day'],
      },
    ],
  }
); 