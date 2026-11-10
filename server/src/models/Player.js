const mongoose = require('mongoose')

// Um "piloto" (jogador) e o estado completo do jogo dele.
// O estado do jogo (`game`) é um documento livre (Mixed): quem valida o formato é o
// validator em src/validators, assim o front pode evoluir o jogo sem migrar o banco.
const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 16 },
    emblem: { type: String, required: true, trim: true, maxlength: 40 },
    game: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true, // createdAt e updatedAt automáticos
    minimize: false, // mantém objetos vazios (ex.: generators: {}) em vez de descartá-los
  },
)

// Nome único, ignorando maiúsculas/minúsculas e acentos ("Nova" = "nova" = "NOVA")
playerSchema.index({ name: 1 }, { unique: true, collation: { locale: 'pt', strength: 1 } })
// Acelera o ranking
playerSchema.index({ 'game.lifetimeEarned': -1 })

// Na resposta JSON: expõe "id" em vez de "_id" e esconde "__v"
playerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id)
    delete ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Player', playerSchema)
