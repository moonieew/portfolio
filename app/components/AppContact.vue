<template lang="pug">
.mail
  //- Compose toolbar
  .mail__toolbar
    button.mail__send(type="button" @click="send")
      span.mail__send-ico ➤
      span Send
    .mail__tools
      span.mail__tool(v-for="t in tools" :key="t" :title="t") {{ glyphs[t] }}
    span.mail__account {{ email }}

  //- Message
  form.mail__form(@submit.prevent="send")
    .mail__field
      label.mail__label To
      span.mail__to
        | {{ email }}
        span.mail__to-tag primary
    .mail__field
      label.mail__label From
      input.mail__input(v-model.trim="form.name" type="text" placeholder="Your name")
    .mail__field
      label.mail__label Email
      input.mail__input(v-model.trim="form.email" type="email" placeholder="you@domain.com")
    .mail__field
      label.mail__label Subject
      input.mail__input(v-model.trim="form.subject" type="text" placeholder="Let's build something stable")
    textarea.mail__body(
      v-model="form.message"
      placeholder="Tell me about the system you're building…"
    )

    footer.mail__foot
      .mail__signed
        span.mail__signed-mark ✦
        .mail__signed-text
          span.mail__signed-name Lê Thị Minh Nguyệt — Anna
          a.mail__signed-mail(:href="`mailto:${email}`") {{ email }}
      button.mail__cta(type="submit")
        span Send message
        span ➤
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const email = 'ltmnguyet.131@gmail.com'

const tools = ['Attach', 'Photo', 'Format', 'Archive']
const glyphs: Record<string, string> = {
  Attach: '📎',
  Photo: '🖼',
  Format: 'A',
  Archive: '🗄',
}

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})

function send() {
  const subject = encodeURIComponent(form.subject || 'Hello Anna')
  const from = form.name || 'A visitor'
  const reply = form.email ? ` (${form.email})` : ''
  const body = encodeURIComponent(`${form.message}\n\n— ${from}${reply}`)
  if (typeof window !== 'undefined') {
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }
}
</script>

<style scoped>
.mail { height: 100%; display: flex; flex-direction: column; background: var(--color-ink-soft); }

/* Toolbar */
.mail__toolbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 46px;
  padding: 0 0.8rem;
  border-bottom: 1px solid var(--hairline);
  background: var(--veil-1);
}
.mail__send {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  border-radius: 0.55rem;
  border: 1px solid transparent;
  font-size: 0.78rem;
  font-weight: 600;
  color: #0a1f12;
  background: linear-gradient(100deg, var(--color-neon), var(--neon-2));
  box-shadow: 0 8px 22px -12px var(--color-neon);
  cursor: pointer;
}
.mail__send-ico { transform: rotate(-0deg); }
.mail__tools { display: flex; gap: 0.4rem; }
.mail__tool {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 0.45rem;
  font-size: 0.85rem;
  background: var(--veil-1);
  border: 1px solid var(--hairline);
  cursor: default;
}
.mail__account {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--color-muted);
}

/* Form */
.mail__form { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; padding: 0.4rem 1.1rem 1.1rem; }
.mail__field {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 0.2rem;
  border-bottom: 1px solid var(--hairline);
}
.mail__label {
  flex: none;
  width: 64px;
  font-size: 0.74rem;
  color: var(--color-muted);
}
.mail__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-fog);
  font-size: 0.88rem;
  font-family: inherit;
}
.mail__input::placeholder { color: var(--placeholder); }
.mail__to { flex: 1; display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; font-weight: 600; }
.mail__to-tag {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 500;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  color: var(--color-neon);
  background: color-mix(in srgb, var(--color-neon) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-neon) 28%, transparent);
}

.mail__body {
  flex: 1;
  min-height: 140px;
  margin-top: 0.9rem;
  padding: 0.4rem 0.2rem;
  background: none;
  border: none;
  outline: none;
  resize: none;
  color: var(--color-fog);
  font-size: 0.9rem;
  line-height: 1.6;
  font-family: inherit;
}
.mail__body::placeholder { color: var(--placeholder); }

.mail__foot {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.6rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--hairline);
}
.mail__signed { display: flex; align-items: center; gap: 0.6rem; }
.mail__signed-mark { color: var(--color-purple); font-size: 1rem; }
.mail__signed-text { display: flex; flex-direction: column; }
.mail__signed-name { font-size: 0.78rem; font-weight: 600; }
.mail__signed-mail { font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-muted); text-decoration: none; }
.mail__signed-mail:hover { color: var(--color-neon); }
.mail__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-fog);
  background: var(--veil-2);
  border: 1px solid var(--hairline-2);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s ease;
}
.mail__cta:hover { transform: translateY(-1px); border-color: color-mix(in srgb, var(--color-neon) 40%, transparent); }
</style>
