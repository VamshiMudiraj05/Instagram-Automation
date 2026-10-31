const token = 'EAAVMTgiBJCMBSxIqPCAq2TyyXT7HlaoTMSw1zPW5dO0hZCpz1JV04ZBlZB2eJrF5jYV8NiDoZAtWbLQxt6kljDNJHx964zYoZAnGCMijjNYlZAs7Hz4tGTXLK101euQrwQa0AbsMETIaGl0JzZBxa9gkugyo5R3xVrrIHFltbTGxtMUhCfxONItG8Nf0zbZC7xHwlS8KhmSI7QMVeVTiDBhvvMpZCH16KRoxZCLEGD9poY8UFVGRtUtAZDZD';

async function test() {
  const fields = ['id', 'name', 'account_id'];
  for (const f of fields) {
    const res = await fetch(`https://graph.facebook.com/v24.0/me?fields=${f}&access_token=${token}`);
    console.log(`Field ${f}:`, await res.json());
  }
}
test();
