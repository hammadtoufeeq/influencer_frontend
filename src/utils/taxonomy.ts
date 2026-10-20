import i18n from '../i18n'

// Profession / industry / topic ka naam chuni hui zaban mein.
// Database mein naam English mein hain; translation "tax.<slug>" se, na ho to asal naam
export function taxName(item: { slug: string; name: string }) {
  return i18n.t(`tax.${item.slug}`, { defaultValue: item.name })
}
