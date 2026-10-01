/** Aura Beauty's supplied makeup and hair menus. The two supplied price lists
 * contain different prices for some similarly named looks; both are displayed
 * separately rather than silently choosing one. Confirm the quote at booking. */
export type AuraItem = { name: string; price: string; description?: string; details?: string[] };
export type AuraSection = { id: string; title: string; emoji: string; category: string; items: AuraItem[]; note?: string };
const item = (name: string, price: string, description?: string, details?: string[]): AuraItem => ({ name, price, description, details });
export const auraSections: AuraSection[] = [
  { id: 'everyday', title: 'Everyday & Event Makeup', emoji: '✨', category: 'Makeup', items: [
    item('Natural / No-Makeup Makeup', '$85', 'Soft, fresh and natural-looking makeup for a polished everyday appearance.'),
    item('Soft Glam', '$100', 'A polished glam look with soft eyes, defined complexion, blush, highlight and customized lips.'),
    item('Full Glam', '$130', 'More defined eyes, sculpted complexion, lashes and a fuller glam finish.'),
    item('Luxury Glam', '$150', 'A fully customized, camera-ready glam look with detailed complexion, eyes and finishing.'),
    item('Party / Special Event Makeup', '$120', 'Perfect for birthdays, dinners, parties, celebrations and special occasions.'),
    item('Date Night Glam', '$100', 'Soft-to-medium glam customized to your personal style.'),
    item('Birthday Glam', '$120', 'Customized glam makeup for birthday celebrations and photos.'),
    item('Prom / Graduation Makeup', '$130', 'Long-wear, photo-ready makeup customized to your outfit and personal style.'),
  ] },
  { id: 'cultural', title: 'South Asian & Cultural Makeup', emoji: '🌸', category: 'Makeup', items: [
    item('South Asian / Indian Glam', '$150', 'Customized makeup for South Asian features, outfits and celebrations.'),
    item('Engagement Makeup', '$180', 'Detailed glam designed for engagement events and photography.'),
    item('Mehndi / Mayoon Makeup', '$150', 'Soft or full glam customized to your outfit and event.'),
    item('Reception / Walima Makeup', '$180', 'Elevated glam designed for formal evening celebrations.'),
    item('Nikah Makeup', '$180', 'Elegant, polished makeup customized to your preferred level of glam.'),
    item('Pre-Wedding Makeup', '$180', 'A detailed glam look for wedding showers, pre-wedding events and celebrations.'),
  ] },
  { id: 'wedding', title: 'Wedding Makeup', emoji: '👰', category: 'Makeup', items: [
    item('Wedding Makeup', '$250', 'A complete customized wedding makeup application.', ['Detailed skin preparation', 'Foundation and complexion matching', 'Face and neck blending', 'Contour and bronzing', 'Blush and highlight', 'Customized wedding eye makeup', 'Eyeliner', 'False lashes', 'Brows', 'Lip preparation', 'Lip liner and lipstick', 'Setting and long-wear finishing', 'Final look check']),
    item('South Asian Wedding Makeup', '$275', 'Customized wedding makeup designed for South Asian wedding looks.', ['Detailed skin preparation', 'Customized complexion', 'Wedding eye makeup', 'False lashes', 'Contour, blush and highlight', 'Long-wear setting', 'Lip customization', 'Wedding finishing']),
  ], note: 'Optional cultural styling: dupatta setting, jewellery placement, hair accessories and wedding accessories. Additional charges may apply depending on requirements.' },
  { id: 'trials', title: 'Wedding Trials', emoji: '💍', category: 'Makeup', items: [
    item('Wedding Makeup Trial', '$125', 'A personalized trial appointment to finalize your wedding-day makeup.', ['Consultation', 'Skin preparation', 'Trial complexion', 'Eye look', 'Lashes', 'Lip selection', 'Final adjustments']),
    item('Wedding Makeup + Hair Trial', '$200', 'Makeup and hairstyling trial performed together to create your complete wedding look.'),
  ] },
  { id: 'party', title: 'Wedding Party & Family', emoji: '👩‍👧', category: 'Makeup', items: [
    item('Bridesmaid Makeup', '$130/person'), item('Mother of Bride / Groom', '$130/person'), item('Family / Wedding Guest Makeup', '$120/person'), item('Flower Girl Makeup', '$50'),
  ], note: 'Group wedding bookings can be customized according to the number of people and services required.' },
  { id: 'photoshoot', title: 'Photoshoot & Content Makeup', emoji: '📸', category: 'Makeup', items: [
    item('Photoshoot Makeup', '$150', 'Camera-ready complexion and customized eye and lip makeup.', ['Professional photoshoots', 'Portfolio shoots', 'Fashion shoots', 'Beauty content', 'Brand shoots']),
    item('Editorial / Creative Makeup', 'From $175', 'For creative, fashion, editorial or highly detailed makeup looks. Pricing depends on complexity, products and time required.'),
  ] },
  { id: 'creative', title: 'Creative & Special Effects', emoji: '🎭', category: 'Makeup', items: [
    item('Creative Makeup', 'From $150', 'Customized artistic makeup for photoshoots, fashion, creative content and special projects.'),
    item('SFX / Special Effects Makeup', 'From $200', 'Customized special-effects looks. A consultation is required before booking.', ['Pricing depends on design complexity', 'Materials', 'Prosthetics', 'Time required']),
  ] },
  { id: 'lessons', title: 'Makeup Lessons', emoji: '💄', category: 'Makeup', items: [
    item('One-on-One Makeup Lesson', '$150', 'Learn how to create your own makeup look with personalized guidance.', ['Skin preparation', 'Foundation matching', 'Concealer', 'Colour correction', 'Contouring', 'Blush', 'Highlight', 'Brows', 'Eyeshadow', 'Eyeliner', 'Lashes', 'Lip application', 'Product selection', 'Brush/tool techniques']),
    item('Self-Makeup Masterclass', '$175', 'A more detailed personalized lesson focused on creating a complete glam look.'),
  ] },
  { id: 'addons', title: 'Makeup Add-Ons', emoji: '✨', category: 'Makeup', items: [
    item('False Lashes', 'Included with Glam & Wedding'), item('Extra Lash / Specialty Lash', 'From $10'), item('Airbrush Makeup', '+$25'), item('Body Glow', '+$20'), item('Additional Body Makeup', 'From $30'), item('Extra Coverage / Detailed Skin Correction', 'From $20'), item('Lip Touch-Up Kit', 'From $15'), item('Touch-Ups During Event', 'From $75/hour'), item('Second Makeup Look', 'From $100'),
  ] },
  { id: 'packages', title: 'Makeup + Hair Packages', emoji: '💎', category: 'Packages', items: [
    item('Soft Glam Package', '$180', 'Soft Glam Makeup + Simple Hairstyling'), item('Full Glam Package', '$230', 'Full Glam Makeup + Glam Hairstyling'), item('Event Glam Package', '$250', 'Luxury/Event Makeup + Hairstyling'), item('Wedding Makeup + Hair', '$350', 'Wedding Makeup + Wedding Hairstyling'), item('South Asian Wedding Makeup + Hair', 'From $400', 'Customized wedding makeup + South Asian wedding hairstyling. Final pricing depends on hairstyle, hair length, extensions and accessories.'),
  ] },
  { id: 'occasion-menu', title: 'Everyday & Occasion · Additional Menu', emoji: '💄', category: 'Makeup', items: [
    item('Natural / Fresh Makeup', '$85'), item('Soft Glam', '$110'), item('Full Glam', '$130'), item('Party / Event Makeup', '$120'), item('Photoshoot / Editorial Makeup', '$130'), item('Graduation Makeup', '$110'), item('Birthday / Special Occasion', '$120'),
  ] },
  { id: 'wedding-menu', title: 'Wedding · Additional Menu', emoji: '👰', category: 'Makeup', items: [
    item('Wedding Makeup', '$250'), item('Wedding Makeup + Lashes', '$275'), item('Engagement Makeup', '$175'), item('Reception Makeup', '$200'), item('Bridesmaid Makeup', '$130'), item('Mother of Bride/Groom', '$120'), item('Wedding Trial', '$125'),
  ] },
  { id: 'south-asian-menu', title: 'South Asian Wedding · Additional Menu', emoji: '🌸', category: 'Makeup', items: [
    item('Traditional / South Asian Wedding Glam', '$275+'), item('HD Wedding Makeup', '$300+'), item('Wedding Makeup + Hair', '$400+'), item('Wedding Makeup + Hair + Draping', '$450+'),
  ] },
  { id: 'additional-addons', title: 'Makeup Add-Ons · Additional Menu', emoji: '✨', category: 'Makeup', items: [
    item('Strip Lashes', '$15'), item('Individual/Cluster Lashes', '$25'), item('Dupatta Setting', '$30'), item('Saree Draping', '$50'), item('Hair Styling', '$75+'), item('Touch-Up Kit', '$25'), item('Travel / On-Location Service', 'Additional fee'),
  ] },
  { id: 'basic-hair', title: 'Basic Hair Styling', emoji: '💇', category: 'Hair', items: [
    item('Blow Dry', '$40+'), item('Straightening', '$45+'), item('Soft Curls / Waves', '$55+'), item('Hollywood Waves', '$75+'), item('Half-Up Hairstyle', '$65+'),
  ] },
  { id: 'party-hair', title: 'Party & Occasion Hair', emoji: '✨', category: 'Hair', items: [
    item('Basic Updo', '$75+'), item('Glam Updo', '$90+'), item('Braided Hairstyle', '$75+'), item('Ponytail / Sleek Pony', '$70+'), item('South Asian Party Hairstyle', '$90+'),
  ] },
  { id: 'wedding-hair', title: 'Wedding Hair', emoji: '💍', category: 'Hair', items: [
    item('Wedding Hairstyle', '$150+'), item('Wedding Updo', '$175+'), item('Wedding Hair + Dupatta Setting', '$200+'), item('Wedding Hair Trial', '$100+'), item('Bridesmaid Hairstyle', '$100+'), item('Engagement Hairstyle', '$125+'),
  ] },
  { id: 'hair-addons', title: 'Hair Add-Ons', emoji: '💎', category: 'Hair', items: [
    item('Dupatta Setting', '$30'), item('Saree Draping', '$50'), item('Hair Accessories Setting', '$20+'), item('Hair Extensions Styling', '$30+'), item('Extension Application', '$50+'), item('Travel / On-Location', 'Additional fee'),
  ] },
];

export const bookingNotes = [
  'Advance booking is required.', 'A $10 non-refundable booking deposit is required to secure your appointment.', 'The deposit is applied toward the final balance.', 'A minimum of 24 hours’ notice is required for rescheduling.', 'Late cancellations and no-shows may result in loss of the deposit.', 'Please arrive with a clean face unless otherwise discussed.', 'Please bring inspiration photos when appropriate.', 'Wedding bookings should be made in advance.', 'Travel and parking fees may apply for mobile services.', 'Custom/creative services are quoted according to the complexity of the requested look.',
];
