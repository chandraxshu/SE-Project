import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9211872448:AAGpcCeJSHVn9Y-uBq8WrCel2Bo5mymQAIA';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://elspfaeehgfwejrmypru.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_sOLjl503ypDhT7qLZlql8w_bJToKalj';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const APP_URL = 'https://khoj-pink.vercel.app';

// Helper: send message to Telegram user
async function sendMessage(chatId: number | string, text: string, replyMarkup?: Record<string, unknown>) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending Telegram message:', err);
  }
}

// Helper: answer callback query (removes loading spinner on buttons)
async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
  } catch (err) {
    console.error('Error answering callback query:', err);
  }
}

// Main Menu Keyboard
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🔍 Report Lost Item', callback_data: 'start_lost' },
        { text: '📦 Report Found Item', callback_data: 'start_found' },
      ],
      [
        { text: '📋 My Active Reports', callback_data: 'my_reports' },
        { text: '🌐 Open Khoj Noticeboard', url: APP_URL },
      ],
    ],
  };
}

// Category Selection Keyboard
function getCategoryKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💻 Electronics', callback_data: 'cat_electronics' },
        { text: '🆔 ID & Cards', callback_data: 'cat_documents' },
      ],
      [
        { text: '🔑 Keys', callback_data: 'cat_keys' },
        { text: '🎒 Wallets & Bags', callback_data: 'cat_wallets' },
      ],
      [
        { text: '📚 Books & Notes', callback_data: 'cat_books' },
        { text: '👕 Clothing', callback_data: 'cat_clothing' },
      ],
      [
        { text: '🍶 Bottles', callback_data: 'cat_bottles' },
        { text: '📦 Other Item', callback_data: 'cat_other' },
      ],
      [
        { text: '❌ Cancel', callback_data: 'cancel_action' },
      ],
    ],
  };
}

// Location Selection Keyboard
function getLocationKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'CC3 (Computer Centre 3)', callback_data: 'loc_CC3 (Computer Centre 3)' },
        { text: 'Library', callback_data: 'loc_Library' },
      ],
      [
        { text: 'Main Building', callback_data: 'loc_Main Building (Admin Block)' },
        { text: 'SAC', callback_data: 'loc_SAC (Student Activity Centre)' },
      ],
      [
        { text: 'Boys Hostel 1-5', callback_data: 'loc_Boys Hostels (BH)' },
        { text: 'Girls Hostel 1-3', callback_data: 'loc_Girls Hostels (GH)' },
      ],
      [
        { text: 'Cafeteria / Canteen', callback_data: 'loc_Campus Cafeteria' },
        { text: 'Sports Complex / Ground', callback_data: 'loc_Sports Complex & Grounds' },
      ],
      [
        { text: '✏️ Type Custom Location', callback_data: 'loc_custom' },
        { text: '❌ Cancel', callback_data: 'cancel_action' },
      ],
    ],
  };
}

// Session state helper
async function getSession(chatId: number) {
  const { data } = await supabase
    .from('telegram_sessions')
    .select('*')
    .eq('chat_id', chatId)
    .single();
  return data;
}

async function updateSession(chatId: number, step: string, data: Record<string, unknown> = {}, userId?: string) {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    step,
    data,
    updated_at: new Date().toISOString(),
  };
  if (userId) payload.user_id = userId;

  await supabase
    .from('telegram_sessions')
    .upsert(payload, { onConflict: 'chat_id' });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Khoj Telegram Webhook Active' });
  }

  const update = req.body;
  if (!update) {
    return res.status(200).send('No update payload');
  }

  try {
    // ------------------------------------------------------------------------
    // 1. Handle Callback Query (Button Clicks)
    // ------------------------------------------------------------------------
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      await answerCallbackQuery(cb.id);

      if (!chatId) return res.status(200).send('OK');

      const session = await getSession(chatId);

      // Cancel Action
      if (data === 'cancel_action') {
        if (session) {
          await updateSession(chatId, 'idle', {}, session.user_id);
        }
        await sendMessage(
          chatId,
          '❌ *Action cancelled.*\n\nYou can start a new lost or found report anytime using the menu below:',
          getMainMenuKeyboard()
        );
        return res.status(200).send('OK');
      }

      // Check if user is linked
      if (!session?.user_id) {
        await sendMessage(
          chatId,
          '⚠️ *Account Not Linked*\n\nPlease log in to the Khoj portal and click **"Connect Telegram Bot"**:\n' +
          `${APP_URL}/dashboard`,
          {
            inline_keyboard: [
              [{ text: '🔗 Open Khoj Dashboard', url: `${APP_URL}/dashboard` }],
            ],
          }
        );
        return res.status(200).send('OK');
      }

      // Start Lost Report
      if (data === 'start_lost') {
        await updateSession(chatId, 'choose_category', { report_type: 'lost' }, session.user_id);
        await sendMessage(
          chatId,
          '🔍 *Report a Lost Item*\n\n**Step 1/5:** What category best describes what you lost?',
          getCategoryKeyboard()
        );
        return res.status(200).send('OK');
      }

      // Start Found Report
      if (data === 'start_found') {
        await updateSession(chatId, 'choose_category', { report_type: 'found' }, session.user_id);
        await sendMessage(
          chatId,
          '📦 *Report a Found Item*\n\n**Step 1/5:** What kind of item did you find?',
          getCategoryKeyboard()
        );
        return res.status(200).send('OK');
      }

      // Category Selected
      if (data.startsWith('cat_')) {
        const category = data.replace('cat_', '');
        const currentData = session.data || {};
        currentData.category = category;

        await updateSession(chatId, 'enter_title', currentData, session.user_id);

        const typeLabel = currentData.report_type === 'found' ? 'found' : 'lost';
        await sendMessage(
          chatId,
          `✏️ *Step 2/5: Item Name*\n\nPlease reply with a concise title for the ${typeLabel} item.\n\n` +
          `_Examples:_\n` +
          `• "Boat Airdopes 141 (Black Case)"\n` +
          `• "IIITA Student ID Card"\n` +
          `• "Room 314 Key with blue tag"\n` +
          `• "Dell 65W Type-C Charger"\n\n` +
          `Type your answer below:`
        );
        return res.status(200).send('OK');
      }

      // Location Selected
      if (data.startsWith('loc_')) {
        const locValue = data.replace('loc_', '');
        const currentData = session.data || {};

        if (locValue === 'custom') {
          await updateSession(chatId, 'enter_custom_location', currentData, session.user_id);
          await sendMessage(
            chatId,
            '📍 *Custom Location*\n\nPlease type the specific campus location where you last saw the item (e.g., "Room 214 CC3", "Nescafe kiosk table", "SAC Gym"): '
          );
          return res.status(200).send('OK');
        }

        currentData.location = locValue;
        await updateSession(chatId, 'enter_description', currentData, session.user_id);

        await sendMessage(
          chatId,
          `📝 *Step 4/5: Description*\n\nPlease reply with a brief description.\n\n` +
          `Include details like circumstances of loss, specific markings, color, condition, or stickers:`
        );
        return res.status(200).send('OK');
      }

      // Skip Photo
      if (data === 'skip_photo') {
        const currentData = session.data || {};
        await publishItem(chatId, session.user_id, currentData, null);
        return res.status(200).send('OK');
      }

      // My Reports
      if (data === 'my_reports') {
        const { data: myItems } = await supabase
          .from('items')
          .select('id, title, category, status, report_type, location, created_at')
          .eq('reported_by', session.user_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!myItems || myItems.length === 0) {
          await sendMessage(
            chatId,
            '📋 *You have no reported items yet.*\n\nUse the buttons below to report a lost or found item:',
            getMainMenuKeyboard()
          );
          return res.status(200).send('OK');
        }

        let reportMsg = '📋 *Your Recent Reports:*\n\n';
        for (const item of myItems) {
          const typeBadge = item.report_type === 'found' ? '🟢 Found' : '🔴 Lost';
          reportMsg += `• *${item.title}* (${typeBadge})\n  Status: \`${item.status.toUpperCase()}\`\n  Location: ${item.location}\n  [View Listing](${APP_URL}/items/${item.id})\n\n`;
        }

        await sendMessage(chatId, reportMsg, getMainMenuKeyboard());
        return res.status(200).send('OK');
      }

      return res.status(200).send('OK');
    }

    // ------------------------------------------------------------------------
    // 2. Handle Text Messages & Photo Uploads
    // ------------------------------------------------------------------------
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text = msg.text?.trim();

      if (!chatId) return res.status(200).send('OK');

      const session = await getSession(chatId);

      // Command: /start or /start <token>
      if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        const token = parts[1]?.trim();

        if (token) {
          // Attempt to link account via token (User ID)
          const username = msg.from?.username ? `@${msg.from.username}` : null;
          const { data: linkResult, error: linkErr } = await supabase.rpc('link_telegram_account', {
            p_user_id: token,
            p_chat_id: chatId,
            p_username: username,
          });

          if (linkErr || !linkResult?.success) {
            await sendMessage(
              chatId,
              '⚠️ *Account Link Failed*\n\nThe link was invalid or expired. Please visit your Khoj dashboard and click "Connect Telegram Bot" again:\n' +
              `${APP_URL}/dashboard`
            );
            return res.status(200).send('OK');
          }

          await sendMessage(
            chatId,
            `🎉 *Welcome to Khoj IIITA, ${linkResult.full_name}!*\n\n` +
            `Your Telegram account has been securely linked to \`${linkResult.email}\`.\n\n` +
            `You can now report lost or found items directly from Telegram in under 30 seconds!`,
            getMainMenuKeyboard()
          );
          return res.status(200).send('OK');
        }

        // /start without token
        if (session?.user_id) {
          await sendMessage(
            chatId,
            `👋 *Welcome back to Khoj — IIITA!* \n\nHow can I help you today?`,
            getMainMenuKeyboard()
          );
        } else {
          await sendMessage(
            chatId,
            `👋 *Welcome to Khoj — IIITA Lost & Found Bot!*\n\n` +
            `This bot lets IIIT Allahabad students report lost & found items and receive instant campus alerts.\n\n` +
            `To get started, link your verified **@iiita.ac.in** account:`,
            {
              inline_keyboard: [
                [{ text: '🔗 Link My Khoj Account', url: `${APP_URL}/dashboard` }],
              ],
            }
          );
        }
        return res.status(200).send('OK');
      }

      // Command: /cancel
      if (text === '/cancel') {
        if (session) {
          await updateSession(chatId, 'idle', {}, session.user_id);
        }
        await sendMessage(
          chatId,
          '❌ Current action cancelled.',
          getMainMenuKeyboard()
        );
        return res.status(200).send('OK');
      }

      // Command: /help
      if (text === '/help') {
        await sendMessage(
          chatId,
          `ℹ️ *Khoj Bot Commands:*\n\n` +
          `• /start - Open main menu\n` +
          `• /lost - Report a lost item\n` +
          `• /found - Report a found item\n` +
          `• /myitems - View your active reports\n` +
          `• /cancel - Cancel current flow\n\n` +
          `🌐 Portal: ${APP_URL}`,
          getMainMenuKeyboard()
        );
        return res.status(200).send('OK');
      }

      // Command: /lost or /found shortcuts
      if (text === '/lost' && session?.user_id) {
        await updateSession(chatId, 'choose_category', { report_type: 'lost' }, session.user_id);
        await sendMessage(
          chatId,
          '🔍 *Report a Lost Item*\n\n**Step 1/5:** Select category:',
          getCategoryKeyboard()
        );
        return res.status(200).send('OK');
      }

      if (text === '/found' && session?.user_id) {
        await updateSession(chatId, 'choose_category', { report_type: 'found' }, session.user_id);
        await sendMessage(
          chatId,
          '📦 *Report a Found Item*\n\n**Step 1/5:** Select category:',
          getCategoryKeyboard()
        );
        return res.status(200).send('OK');
      }

      // If user is not linked yet
      if (!session?.user_id) {
        await sendMessage(
          chatId,
          '🔒 Please link your verified IIITA account first by clicking **"Connect Telegram Bot"** in your Khoj Dashboard:\n' +
          `${APP_URL}/dashboard`,
          {
            inline_keyboard: [
              [{ text: '🔗 Connect Khoj Account', url: `${APP_URL}/dashboard` }],
            ],
          }
        );
        return res.status(200).send('OK');
      }

      // Step: enter_title
      if (session.step === 'enter_title' && text) {
        const currentData = session.data || {};
        currentData.title = text;

        await updateSession(chatId, 'choose_location', currentData, session.user_id);
        await sendMessage(
          chatId,
          `📍 *Step 3/5: Location*\n\nWhere was **"${text}"** last seen on campus?`,
          getLocationKeyboard()
        );
        return res.status(200).send('OK');
      }

      // Step: enter_custom_location
      if (session.step === 'enter_custom_location' && text) {
        const currentData = session.data || {};
        currentData.location = text;

        await updateSession(chatId, 'enter_description', currentData, session.user_id);
        await sendMessage(
          chatId,
          `📝 *Step 4/5: Description*\n\nPlease reply with a brief description (color, markings, brand, circumstances of loss):`
        );
        return res.status(200).send('OK');
      }

      // Step: enter_description
      if (session.step === 'enter_description' && text) {
        const currentData = session.data || {};
        currentData.description = text;

        await updateSession(chatId, 'send_photo', currentData, session.user_id);
        await sendMessage(
          chatId,
          `📸 *Step 5/5: Reference Photo (Optional)*\n\n` +
          `Please upload a photograph of the item, serial tag, or invoice.\n\n` +
          `If you don't have a picture right now, click **Skip Photo** below:`,
          {
            inline_keyboard: [
              [{ text: '⏩ Skip Photo & Publish', callback_data: 'skip_photo' }],
              [{ text: '❌ Cancel', callback_data: 'cancel_action' }],
            ],
          }
        );
        return res.status(200).send('OK');
      }

      // Step: send_photo (Photo message received)
      if (session.step === 'send_photo' && msg.photo && msg.photo.length > 0) {
        await sendMessage(chatId, '⏳ *Uploading photo and publishing notice...*');

        const currentData = session.data || {};
        const largestPhoto = msg.photo[msg.photo.length - 1];
        const fileId = largestPhoto.file_id;

        // Fetch file path from Telegram
        const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
        const fileJson = await fileRes.json();

        let photoUrl: string | null = null;
        if (fileJson.ok && fileJson.result?.file_path) {
          const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileJson.result.file_path}`;
          const imgBlob = await (await fetch(downloadUrl)).arrayBuffer();

          const fileName = `telegram_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(fileName, imgBlob, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('item-photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          } else {
            console.error('Storage upload error:', uploadError.message);
          }
        }

        await publishItem(chatId, session.user_id, currentData, photoUrl);
        return res.status(200).send('OK');
      }

      // Default fallback
      await sendMessage(
        chatId,
        `👋 *Khoj — IIITA Lost & Found*\n\nChoose an action from the menu below:`,
        getMainMenuKeyboard()
      );
      return res.status(200).send('OK');
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Telegram webhook handler error:', err);
    return res.status(200).send('Error handled');
  }
}

// Publish Item Helper
async function publishItem(
  chatId: number,
  userId: string,
  data: Record<string, any>,
  photoUrl: string | null
) {
  try {
    const reportType = data.report_type || 'lost';
    const title = data.title || 'Untitled Item';
    const category = data.category || 'other';
    const location = data.location || 'IIIT Allahabad Campus';
    const description = data.description || 'Reported via Khoj Telegram Bot';

    const { data: newItem, error: insertError } = await supabase
      .from('items')
      .insert({
        title,
        category,
        location,
        description,
        report_type: reportType,
        status: 'active',
        reported_by: userId,
        photo_url: photoUrl,
        date_occurred: new Date().toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // Reset session
    await updateSession(chatId, 'idle', {}, userId);

    const typeEmoji = reportType === 'found' ? '🟢' : '🔴';
    const typeLabel = reportType === 'found' ? 'Found Item' : 'Lost Item';
    const itemUrl = `${APP_URL}/items/${newItem.id}`;

    await sendMessage(
      chatId,
      `🎉 *${typeLabel} Notice Published Successfully!* ${typeEmoji}\n\n` +
      `📌 *Title:* ${title}\n` +
      `🏷️ *Category:* ${category}\n` +
      `📍 *Location:* ${location}\n\n` +
      `Your report is now live on the campus noticeboard:\n` +
      `🔗 [View Live Listing](${itemUrl})\n\n` +
      `Other students and security desks can now match and view your report!`,
      {
        inline_keyboard: [
          [{ text: '🌐 View Live on Khoj Portal', url: itemUrl }],
          [{ text: '➕ Report Another Item', callback_data: 'start_lost' }],
        ],
      }
    );
  } catch (err) {
    console.error('Failed to publish item:', err);
    await sendMessage(
      chatId,
      '❌ *Failed to publish notice.* Please try again later or post directly on the website:\n' +
      `${APP_URL}/browse`,
      getMainMenuKeyboard()
    );
  }
}
