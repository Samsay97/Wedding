const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store"
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Метод не поддерживается"
      },
      405,
      {
        Allow: "POST"
      }
    );
  }

  /*
   * Разрешаем отправку только со страницы,
   * находящейся на этом же домене.
   */
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin && origin !== requestUrl.origin) {
    return jsonResponse(
      {
        ok: false,
        error: "Запрос с другого сайта запрещён"
      },
      403
    );
  }

  if (
    !env.TELEGRAM_BOT_TOKEN ||
    !env.TELEGRAM_CHAT_ID
  ) {
    console.error("Telegram secrets are missing");

    return jsonResponse(
      {
        ok: false,
        error: "Форма временно не настроена"
      },
      500
    );
  }

  try {
    const rawBody = await request.text();

    if (rawBody.length > 10000) {
      return jsonResponse(
        {
          ok: false,
          error: "Слишком большой запрос"
        },
        413
      );
    }

    let data;

    try {
      data = JSON.parse(rawBody);
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "Неверный формат данных"
        },
        400
      );
    }

    const name = cleanText(data.name, 120);
    const phone = cleanText(data.phone, 40);
    const comment = cleanText(data.message, 1000);

    const attendance =
      data.attendance === "yes"
        ? "✅ С радостью приду"
        : data.attendance === "no"
          ? "❌ К сожалению, не смогу"
          : "";

    if (!name || !phone || !attendance) {
      return jsonResponse(
        {
          ok: false,
          error: "Заполните все обязательные поля"
        },
        400
      );
    }

    const phoneDigits =
      phone.replace(/\D/g, "");

    if (
      phoneDigits.length !== 11 ||
      !phoneDigits.startsWith("7")
    ) {
      return jsonResponse(
        {
          ok: false,
          error: "Введите номер телефона полностью"
        },
        400
      );
    }

    const submittedAt =
      new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());

    const telegramMessage = [
      "💍 Новая анкета гостя",
      "",
      "👤 Имя:",
      name,
      "",
      "📞 Телефон:",
      phone,
      "",
      "💒 Присутствие:",
      attendance,
      "",
      "💌 Комментарий:",
      comment || "Нет комментария",
      "",
      "────────────",
      "",
      "🤍 Александр & Лиана",
      "📅 05 сентября 2026",
      `⏰ ${submittedAt}`
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: telegramMessage
        })
      }
    );

    let telegramResult = null;

    try {
      telegramResult =
        await telegramResponse.json();
    } catch {
      telegramResult = null;
    }

    if (
      !telegramResponse.ok ||
      !telegramResult?.ok
    ) {
      console.error(
        "Telegram request failed:",
        telegramResponse.status
      );

      return jsonResponse(
        {
          ok: false,
          error: "Не удалось отправить анкету"
        },
        502
      );
    }

    return jsonResponse({
      ok: true
    });

  } catch (error) {
    console.error("RSVP error:", error);

    return jsonResponse(
      {
        ok: false,
        error: "Внутренняя ошибка сервера"
      },
      500
    );
  }
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function jsonResponse(
  data,
  status = 200,
  additionalHeaders = {}
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        ...JSON_HEADERS,
        ...additionalHeaders
      }
    }
  );
}