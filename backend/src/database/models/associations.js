
import { User } from './User.js';
import { Reference } from './Reference.js';
import { ReferenceAuthor } from './ReferenceAuthor.js';

// Um usuário pode possuir várias referências
User.hasMany(Reference, {
  foreignKey: 'usuarioId',
  as: 'referencias'
});

// Cada referência pertence a um usuário
Reference.belongsTo(User, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// Uma referência pode possuir vários autores
Reference.hasMany(ReferenceAuthor, {
  foreignKey: 'referenciaId',
  as: 'autores'
});

// Cada autor pertence a uma referência
ReferenceAuthor.belongsTo(Reference, {
  foreignKey: 'referenciaId',
  as: 'referencia'
});
