async function test() {
  const res = await fetch("https://instagram-automation-brown.vercel.app/api/instagram/media?userId=122094857097540700");
  console.log("Status for 122094857097540700:", res.status);
  const json = await res.json();
  console.log("Data count:", json?.data?.length, "Error:", json?.error);

  const res2 = await fetch("https://instagram-automation-brown.vercel.app/api/instagram/media?userId=17841479501766910");
  console.log("Status for 17841479501766910:", res2.status);
  const json2 = await res2.json();
  console.log("Data count:", json2?.data?.length, "Error:", json2?.error);

  const resActive = await fetch("https://instagram-automation-brown.vercel.app/api/instagram/active-user");
  console.log("Active user status:", resActive.status);
  const jsonActive = await resActive.json();
  console.log("Active user:", jsonActive);
}
test().catch(console.error);
