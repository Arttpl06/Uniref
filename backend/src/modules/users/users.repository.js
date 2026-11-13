import { User } from '../../database/models/User.js';

export async function findByFirebaseUid(firebaseUid) {
  return User.findOne({
    where: { firebaseUid }
  });
}

export async function createUser(data) {
  return User.create(data);
}

export async function updateUser(user, data) {
  return user.update(data);
}
