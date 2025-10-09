# URGENT - Problème Backend : content = {} (objet vide)

## 🔴 Problème identifié

Le backend retourne `content: {}` (objet vide) au lieu du texte du message.

### Preuve
Logs frontend :
```
📝 Content brut (type: object): {}
length: 0
```

## ✅ Format attendu par le frontend

### Pour un message utilisateur simple :
```json
{
  "id": 1,
  "role": "user",
  "content": "coucou es-tu fonctionnelle ?",
  "createdAt": "2025-10-09T10:00:00Z"
}
```

### OU avec champ `message` :
```json
{
  "id": 1,
  "role": "user",
  "message": "coucou es-tu fonctionnelle ?",
  "createdAt": "2025-10-09T10:00:00Z"
}
```

### OU format structuré (IA) :
```json
{
  "id": 2,
  "role": "assistant",
  "content": [
    { "type": "text", "text": "Oui je fonctionne !" }
  ],
  "createdAt": "2025-10-09T10:00:05Z"
}
```

## 🔧 Corrections backend nécessaires

### 1. Vérifier POST /assistant/messages

Le message utilisateur doit être sauvegardé avec son texte :

```javascript
// ❌ MAUVAIS - sauvegarde un objet vide
await prisma.assistant_messages.create({
  data: {
    conversationId,
    userId: req.user.id,
    role: 'user',
    content: {}, // ← PROBLÈME !
    status: 'completed',
  }
})

// ✅ BON - sauvegarde le texte
await prisma.assistant_messages.create({
  data: {
    conversationId,
    userId: req.user.id,
    role: 'user',
    content: req.body.message, // ← String simple
    status: 'completed',
  }
})

// ✅ AUSSI BON - utiliser un champ "message" séparé
await prisma.assistant_messages.create({
  data: {
    conversationId,
    userId: req.user.id,
    role: 'user',
    message: req.body.message, // ← Texte ici
    content: JSON.stringify([{ type: 'text', text: req.body.message }]),
    status: 'completed',
  }
})
```

### 2. Vérifier GET /assistant/conversations/:id/messages

La sérialisation doit retourner le bon format :

```javascript
router.get('/conversations/:id/messages', authGuard, async (req, res) => {
  const messages = await prisma.assistant_messages.findMany({
    where: { conversationId: parseInt(req.params.id) },
    orderBy: { createdAt: 'asc' },
  })
  
  console.log('📤 Messages bruts DB:', messages) // ← Ajouter ce log !
  
  const formatted = messages.map(msg => {
    // Si content est stocké comme JSON string, le parser
    let content = msg.content
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content)
      } catch {
        // Si parse échoue, c'est du texte simple
        content = content
      }
    }
    
    return {
      id: msg.id,
      role: msg.role,
      content, // ← Doit être string ou array, JAMAIS {}
      message: msg.message, // ← Fallback si content est vide
      createdAt: msg.createdAt.toISOString(),
      status: msg.status,
    }
  })
  
  console.log('📤 Messages formatés:', formatted) // ← Ajouter ce log !
  
  res.json({ messages: formatted })
})
```

### 3. Vérifier le schéma Prisma

Le champ `content` doit être de type `String` ou `Text` :

```prisma
model assistant_messages {
  id             Int      @id @default(autoincrement())
  conversationId Int
  userId         Int
  role           String
  content        String   @db.Text // ← Important !
  message        String?  @db.Text // ← Optionnel, fallback
  status         String   @default("completed")
  createdAt      DateTime @default(now())
  
  conversation   assistant_conversations @relation(...)
  user          User @relation(...)
}
```

## 🧪 Test rapide côté backend

### 1. Créer un message de test directement en DB :

```sql
INSERT INTO assistant_messages (conversation_id, user_id, role, content, status, created_at)
VALUES (1, 1, 'user', 'Test message direct', 'completed', NOW());
```

### 2. Appeler GET /messages et vérifier :

```bash
curl -H "Authorization: Bearer ton_token" \
     http://localhost:3000/assistant/conversations/1/messages
```

**Réponse attendue** :
```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Test message direct",  ← Doit être une STRING, pas {}
      "createdAt": "2025-10-09T10:00:00.000Z"
    }
  ]
}
```

## 🔍 Logs à ajouter temporairement

Dans `POST /assistant/messages` :
```javascript
console.log('📥 Body reçu:', req.body)
console.log('📝 Message à sauvegarder:', req.body.message)

const userMessage = await prisma.assistant_messages.create({ ... })

console.log('💾 Message sauvegardé:', userMessage)
console.log('💾 Content type:', typeof userMessage.content)
console.log('💾 Content value:', userMessage.content)
```

Dans `GET /assistant/conversations/:id/messages` :
```javascript
const messages = await prisma.assistant_messages.findMany({ ... })

console.log('📤 Premier message DB:', messages[0])
console.log('📤 Content type:', typeof messages[0]?.content)
console.log('📤 Content value:', messages[0]?.content)
```

## ⚠️ Causes probables

1. **Mauvaise désérialisation** : Prisma retourne un objet vide au lieu d'une string
2. **Mauvais mapping** : Le code backend transforme la string en `{}`
3. **Champ manquant** : `content` n'est pas dans le SELECT
4. **Type JSON** : Le champ est de type `JSON` dans Prisma au lieu de `String`

## 🚀 Correction temporaire frontend (déjà appliquée)

Le frontend va maintenant chercher dans ces champs dans l'ordre :
1. `message.content`
2. `message.text`
3. `message.body`
4. `message.message`

Donc si tu ajoutes un champ `message` à ta réponse, ça va marcher :
```json
{
  "id": 1,
  "role": "user",
  "content": {},  ← Même si vide
  "message": "coucou es-tu fonctionnelle ?",  ← Le frontend va utiliser celui-ci
  "createdAt": "..."
}
```

Mais la **vraie solution** est de corriger le backend pour que `content` soit une string !
