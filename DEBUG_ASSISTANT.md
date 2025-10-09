# Debug Assistant - Messages vides

## Problème actuel
Les messages s'affichent mais le contenu est "Message vide".

## Nouveaux logs de débogage 🔍

### Console du navigateur (F12)
Quand tu envoies un message, tu devrais voir :

```
📤 Envoi message: { conversationId: "...", message: "coucou" }
✅ Message envoyé avec succès: { ... }
📩 Messages bruts reçus: { messages: [...] }

🔍 Normalisation message #0: { id: 1, role: "user", content: "..." }
📝 Content brut (type: string): "coucou es-tu fonctionnelle ?"
🔸 Normalisation segment: { type: "text", text: "coucou es-tu fonctionnelle ?" }
✅ Segments finaux (1): [{ type: "text", text: "coucou es-tu fonctionnelle ?" }]

📨 Messages normalisés: [{ id: 1, role: "user", content: [...] }]
```

### Scénarios possibles

#### ✅ CAS 1 : Content est une string simple
```json
{
  "id": 1,
  "role": "user",
  "content": "Bonjour, comment ça va ?"
}
```
**Correction appliquée** : Convertit automatiquement en `[{ type: "text", text: "..." }]`

#### ✅ CAS 2 : Content est déjà un tableau
```json
{
  "id": 1,
  "role": "user",
  "content": [
    { "type": "text", "text": "Bonjour" }
  ]
}
```
**Géré nativement** : Reste tel quel

#### ✅ CAS 3 : Content est du JSON stringifié
```json
{
  "id": 1,
  "role": "user",
  "content": "[{\"type\":\"text\",\"text\":\"Bonjour\"}]"
}
```
**Correction appliquée** : Parse automatiquement le JSON

#### ⚠️ CAS 4 : Content est undefined/null
```json
{
  "id": 1,
  "role": "user"
}
```
**Fallback** : Affiche "Message vide"

## Vérifications backend 🔧

### 1. Structure de la réponse attendue

Voici les formats acceptés par le frontend :

**Format simple (recommandé pour messages utilisateur)** :
```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "coucou es-tu fonctionnelle ?",
      "createdAt": "2025-10-09T10:00:00Z"
    }
  ]
}
```

**Format structuré (pour messages IA avec boutons/liens)** :
```json
{
  "messages": [
    {
      "id": 2,
      "role": "assistant",
      "content": [
        { "type": "text", "text": "Oui je suis fonctionnelle !" },
        { "type": "button", "text": "Voir mes partenaires", "payload": { "action": "show_partners" } }
      ],
      "createdAt": "2025-10-09T10:00:05Z"
    }
  ]
}
```

### 2. Vérifier la sauvegarde en base

**Prisma Schema attendu** :
```prisma
model assistant_messages {
  id             Int      @id @default(autoincrement())
  conversationId Int
  userId         Int
  role           String   // "user" | "assistant" | "system"
  content        String   @db.Text // JSON stringifié ou texte simple
  status         String   @default("completed")
  createdAt      DateTime @default(now())
  
  conversation   assistant_conversations @relation(...)
  user          User @relation(...)
}
```

**Insertion correcte** :
```javascript
// Pour un message utilisateur
await prisma.assistant_messages.create({
  data: {
    conversationId,
    userId: req.user.id,
    role: 'user',
    content: req.body.message, // ← String simple OK !
    status: 'completed',
  }
})

// Pour un message IA avec segments
await prisma.assistant_messages.create({
  data: {
    conversationId,
    userId: req.user.id,
    role: 'assistant',
    content: JSON.stringify([
      { type: 'text', text: 'Voici ma réponse' },
      { type: 'button', text: 'Action', payload: {...} }
    ]),
    status: 'completed',
  }
})
```

### 3. Route GET /assistant/conversations/:id/messages

**Code backend attendu** :
```javascript
router.get('/conversations/:id/messages', authGuard, async (req, res) => {
  const messages = await prisma.assistant_messages.findMany({
    where: { conversationId: parseInt(req.params.id) },
    orderBy: { createdAt: 'asc' },
  })
  
  // Transformer content si besoin
  const formatted = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content, // ← Peut être string ou JSON stringifié
    createdAt: msg.createdAt.toISOString(),
    status: msg.status,
  }))
  
  res.json({ messages: formatted })
})
```

## Tests à faire maintenant 🧪

### 1. Ouvre la console (F12) et envoie "Test 1"

Cherche ces logs :
```
🔍 Normalisation message #0: { ... }
📝 Content brut (type: ???): ???
```

**Si `type: string`** → Le backend retourne bien une string simple ✅
**Si `type: object`** → Le backend retourne un objet, mais peut-être mal formaté
**Si `type: undefined`** → Le champ `content` est absent ! ❌

### 2. Vérifie la valeur du content brut

**Si c'est vide** (`""` ou `null`) :
→ Problème backend : le message n'est pas sauvegardé avec le bon contenu

**Si c'est du JSON** (`"[{\"type\":\"text\"...}]"`) :
→ Frontend va le parser automatiquement ✅

**Si c'est une string normale** (`"coucou es-tu fonctionnelle ?"`) :
→ Frontend va créer un segment text automatiquement ✅

### 3. Vérifie les segments finaux

```
✅ Segments finaux (1): [{ type: "text", text: "..." }]
```

**Si le tableau est vide** (`[]`) :
→ La normalisation échoue, envoie-moi le log `📝 Content brut`

**Si le texte est vide** (`text: ""`) :
→ Le backend sauvegarde le message sans contenu

## Correction backend probable 🔧

### Problème : Le champ `content` n'est pas renvoyé

**Cause** : Mauvaise sérialisation ou champ oublié dans le SELECT

**Solution** :
```javascript
// ❌ MAUVAIS
const messages = await prisma.assistant_messages.findMany({
  where: { conversationId },
  select: { id: true, role: true, createdAt: true } // ← Oubli !
})

// ✅ BON
const messages = await prisma.assistant_messages.findMany({
  where: { conversationId },
  // Pas de select → retourne tous les champs
})
```

### Problème : Content est sauvegardé vide

**Cause** : Le POST /assistant/messages ne sauvegarde pas le texte

**Solution** :
```javascript
// Dans POST /assistant/messages
const userMessage = await prisma.assistant_messages.create({
  data: {
    conversationId,
    userId: req.user.id,
    role: 'user',
    content: req.body.message, // ⚠️ Vérifier que req.body.message existe !
    status: 'completed',
  }
})

console.log('💾 Message sauvegardé:', userMessage)
// Devrait afficher : { id: 1, content: "coucou es-tu fonctionnelle ?", ... }
```

## Prochaines étapes

1. ✅ **Envoie un message** et copie-moi tous les logs de la console
2. ✅ **Vérifie en base** : `SELECT * FROM assistant_messages WHERE conversation_id = X`
3. ✅ **Teste avec curl** :
```bash
curl -H "Authorization: Bearer ton_token" \
     http://localhost:3000/assistant/conversations/1/messages
```

Si après ça le problème persiste, envoie-moi :
- Les logs console complets (surtout `📝 Content brut`)
- La réponse SQL brute de ta base
- La réponse curl de l'endpoint GET messages

## Corrections appliquées ✅

### 1. Invalidation automatique du cache React Query
**Fichier**: `src/hooks/useAssistant.js`

```javascript
export function useSendAssistantMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: sendAssistantMessage,
    onSuccess: (data, variables) => {
      // Invalider les messages de la conversation
      if (variables?.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: assistantKeys.messages(variables.conversationId) 
        })
      }
      // Invalider la liste des conversations
      queryClient.invalidateQueries({ 
        queryKey: assistantKeys.conversations() 
      })
    },
  })
}
```

### 2. Rafraîchissement immédiat après envoi
**Fichier**: `src/pages/assistant.jsx`

```javascript
const handleSendMessage = async (event) => {
  // ... création conversation si besoin ...
  
  await sendMessageMutation.mutateAsync({
    conversationId,
    message: userMessage,
  })

  // Rafraîchir IMMÉDIATEMENT pour afficher le message utilisateur
  await refetchMessages()
  
  // Puis lancer le polling pour la réponse IA
  startPolling(conversationId, lastTimestamp)
}
```

### 3. Logs de débogage
Ajout de console.logs pour tracer le flux :

- `📤 Envoi message:` → payload envoyé au backend
- `✅ Message envoyé avec succès:` → réponse du POST /assistant/messages
- `📩 Messages bruts reçus:` → réponse du GET /assistant/conversations/:id/messages
- `📨 Messages normalisés:` → messages après transformation

## Checklist backend à vérifier

### ✅ POST /assistant/messages retourne rapidement
```json
{
  "messageId": "123",
  "status": "queued"
}
```
**Temps de réponse attendu**: < 200ms

### ✅ Le message utilisateur est sauvegardé IMMÉDIATEMENT en base
```sql
INSERT INTO assistant_messages (conversation_id, role, content, created_at)
VALUES (?, 'user', ?, NOW())
```
**Important**: Ne pas attendre la réponse de Mistral pour sauvegarder le message user !

### ✅ GET /assistant/conversations/:id/messages retourne TOUS les messages
Exemple de réponse attendue juste après l'envoi :
```json
{
  "messages": [
    {
      "id": "1",
      "role": "user",
      "content": [{ "type": "text", "text": "Bonjour" }],
      "createdAt": "2025-10-09T10:00:00Z",
      "status": "completed"
    },
    {
      "id": "2",
      "role": "user",
      "content": [{ "type": "text", "text": "coucou es-tu fonctionnelle ?" }],
      "createdAt": "2025-10-09T10:05:00Z",
      "status": "completed"
    }
  ]
}
```

### ⚠️ ERREUR COMMUNE : Attendre Mistral avant de retourner
```javascript
// ❌ MAUVAIS
router.post('/messages', async (req, res) => {
  const userMessage = await saveMessage(...)
  const aiResponse = await mistral.chat(...) // ⚠️ Trop lent !
  await saveMessage(aiResponse)
  res.json({ messageId: userMessage.id })
})

// ✅ BON
router.post('/messages', async (req, res) => {
  const userMessage = await saveMessage(...)
  res.json({ messageId: userMessage.id, status: 'queued' })
  
  // Traiter l'IA en arrière-plan
  processAIResponse(conversationId, userMessage).catch(console.error)
})
```

## Test manuel

### 1. Ouvrir la console du navigateur (F12)

### 2. Envoyer un message "Test 1"
Vérifier les logs dans l'ordre :
```
📤 Envoi message: { conversationId: "123", message: "Test 1" }
✅ Message envoyé avec succès: { messageId: "456", status: "queued" }
📩 Messages bruts reçus: { messages: [...] }
📨 Messages normalisés: [{ id: "456", role: "user", content: [...] }]
```

### 3. Vérifier l'affichage
- Le message "Test 1" doit apparaître **immédiatement** en bleu à droite
- L'indicateur "L'assistant tape..." doit apparaître **2 secondes après**
- La réponse IA doit arriver en blanc à gauche

### 4. Vérifier côté backend
```bash
# Logs attendus
POST /assistant/messages { conversationId: 123, message: "Test 1" }
→ Saved user message #456
→ Response 200 OK in 50ms

# Background job
→ Calling Mistral API...
→ Mistral response received in 2.3s
→ Saved assistant message #457
```

## Flux complet attendu

```
[User clique Send]
  ↓
POST /assistant/messages
  ↓ (< 200ms)
Backend sauvegarde message user + retourne { messageId }
  ↓
Frontend reçoit réponse → invalidateQueries → refetchMessages
  ↓ (< 100ms)
GET /assistant/conversations/:id/messages
  ↓
Backend retourne [message user]
  ↓
Frontend affiche message user en bleu
  ↓ (2s de polling)
GET /assistant/conversations/:id/updates?since=ISO
  ↓
Backend retourne { messages: [message IA] }
  ↓
Frontend affiche réponse IA en blanc
```

## Si le message n'apparaît toujours pas

### Scénario A : Le backend ne sauvegarde pas le message user
**Symptôme** : `📩 Messages bruts reçus: { messages: [] }`

**Solution** : Vérifier la route POST /assistant/messages
```javascript
// Assure-toi que le message user est bien inséré en base
const userMessage = await prisma.assistant_messages.create({
  data: {
    conversationId,
    role: 'user',
    content: JSON.stringify([{ type: 'text', text: message }]),
    userId: req.user.id,
    status: 'completed', // ⚠️ Important !
  }
})
```

### Scénario B : Le GET /messages ne retourne pas le message
**Symptôme** : `📩 Messages bruts reçus: { messages: [...] }` mais le tableau est vide ou incomplet

**Solution** : Vérifier la requête Prisma
```javascript
const messages = await prisma.assistant_messages.findMany({
  where: { conversationId },
  orderBy: { createdAt: 'asc' },
  // ⚠️ Ne pas filtrer par status !
})
```

### Scénario C : Le format de réponse est incorrect
**Symptôme** : `📨 Messages normalisés: []` alors que les bruts sont OK

**Solution** : Vérifier que le backend retourne bien :
```json
{
  "messages": [
    {
      "id": "...",
      "role": "user",
      "content": [
        { "type": "text", "text": "..." }
      ],
      "createdAt": "2025-10-09T10:00:00.000Z"
    }
  ]
}
```

## Tests recommandés

1. ✅ Créer une conversation
2. ✅ Envoyer "Test 1" → vérifier affichage immédiat
3. ✅ Attendre réponse IA → vérifier affichage après 2-4s
4. ✅ Envoyer "Test 2" → vérifier que les 2 messages user + 1 IA sont visibles
5. ✅ Recharger la page → vérifier que tous les messages persistent

## Contact
Si le problème persiste après ces vérifications, envoie-moi :
- Les logs console du front (📤📩📨)
- Les logs du backend (POST + GET)
- La réponse JSON brute de GET /assistant/conversations/:id/messages
