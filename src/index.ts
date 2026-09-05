import { createFarmingWeightCalculator } from "farming-weight";
import { ProfileNetworthCalculator } from "skyhelper-networth";
import Fastify from "fastify";

const app = Fastify();

app.post("/farming-weight", async (request) => {
  const { profile, uuid: rawUuid } = request.body as any;
  const member = profile.members[rawUuid.replaceAll("-", "")];
  const jacob = member.jacob_contest;

  return createFarmingWeightCalculator({
    pests: member.bestiary?.kills,
    collection: member.collection,
    contests: Object.values(jacob?.contests ?? {}),
    levelCapUpgrade: jacob?.perks?.farming_level_cap,
    farmingXp: member.player_data?.experience?.SKILL_FARMING,
    anitaBonusFarmingFortuneLevel: jacob?.perks?.double_drops,
    minions: Object.values(profile.members).flatMap(
      (member: any) => member.player_data?.crafted_generators ?? [],
    ),
  }).getWeightInfo();
});

app.post("/networth", async (request) => {
  const { profile, museum, uuid: rawUuid } = request.body as any;
  const uuid = rawUuid.replaceAll("-", "");

  return new ProfileNetworthCalculator(
    profile.members[uuid],
    museum?.members?.[uuid],
    profile.banking?.balance,
  ).getNetworth({
    onlyNetworth: true,
    sortItems: false,
    includeItemData: false,
  });
});

const shutdown = () => void app.close().finally(() => process.exit());
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
console.log("Listening on port", process.env.PORT ?? 3000);
