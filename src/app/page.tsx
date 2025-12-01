"use client";

import { useMemo, useState } from "react";
import type { LifeEvent, LifeEventsData } from "@/types/life-event";
import eventsJson from "@/data/events.json";

import { motion } from "framer-motion";

import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const DAYS_PER_YEAR = 365;
const MAX_AGE_YEARS = 30;
const MAX_DAYS = DAYS_PER_YEAR * MAX_AGE_YEARS;

type LogItem = {
  id: number;
  dice: number;
  day: number;
  ageYears: number;
  ageDays: number;
  moneyAfter: number;
  employmentAfter: string | null;
  itemsAfter: string[];
  companionsAfter: string[];
  event?: LifeEvent;
};

const data = eventsJson as LifeEventsData;

export default function LifeGamePage() {
  const [currentDay, setCurrentDay] = useState(0);
  const [money, setMoney] = useState(0);
  const [employment, setEmployment] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [companions, setCompanions] = useState<string[]>([]);
  const [log, setLog] = useState<LogItem[]>([]);
  const [turn, setTurn] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rolling, setRolling] = useState(false);

  const ageYears = useMemo(
    () => Math.floor(currentDay / DAYS_PER_YEAR),
    [currentDay]
  );
  const ageDays = useMemo(() => currentDay % DAYS_PER_YEAR, [currentDay]);

  const canRoll = !finished && !rolling;

  const handleRollDice = async () => {
    if (!canRoll) return;

    setRolling(true);

    // 少しだけ「振っている感」を出すための待ち時間
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dice = Math.floor(Math.random() * 600) + 1;
    const nextDay = currentDay + dice;

    // 30歳に到達 or 超えたら終了
    if (nextDay >= MAX_DAYS) {
      const clampedDay = MAX_DAYS;
      const finalAgeYears = Math.floor(clampedDay / DAYS_PER_YEAR);
      const finalAgeDays = clampedDay % DAYS_PER_YEAR;

      setCurrentDay(clampedDay);
      setFinished(true);
      setTurn((t) => t + 1);

      setLog((prev) => [
        {
          id: prev.length + 1,
          dice,
          day: clampedDay,
          ageYears: finalAgeYears,
          ageDays: finalAgeDays,
          moneyAfter: money,
          employmentAfter: employment,
          itemsAfter: items,
          companionsAfter: companions,
          event: undefined,
        },
        ...prev,
      ]);

      setRolling(false);
      return;
    }

    const updatedDay = nextDay;
    const updatedAgeYears = Math.floor(updatedDay / DAYS_PER_YEAR);
    const updatedAgeDays = updatedDay % DAYS_PER_YEAR;

    // 年齢に応じたイベント候補
    const availableEvents = data.events.filter((e) => {
      return e.from <= updatedAgeYears && updatedAgeYears <= e.to;
    });

    let selectedEvent: LifeEvent | undefined = undefined;
    if (availableEvents.length > 0) {
      const index = Math.floor(Math.random() * availableEvents.length);
      selectedEvent = availableEvents[index];
    }

    // 状態計算
    let newMoney = money;
    let newEmployment = employment;
    let newItems = [...items];
    let newCompanions = [...companions];

    if (selectedEvent) {
      // お金
      newMoney += selectedEvent.money;

      // 職業：就く
      if (selectedEvent.employment && selectedEvent.employment.trim() !== "") {
        newEmployment = selectedEvent.employment.trim();
      }

      // 職業：失う
      if (selectedEvent.unemployment) {
        newEmployment = null;
      }

      // アイテム：取得
      if (selectedEvent.get && selectedEvent.get.trim() !== "") {
        const itemName = selectedEvent.get.trim();
        if (!newItems.includes(itemName)) {
          newItems.push(itemName);
        }
      }

      // アイテム：喪失
      if (selectedEvent.lost && selectedEvent.lost.trim() !== "") {
        const lostItem = selectedEvent.lost.trim();
        newItems = newItems.filter((it) => it !== lostItem);
      }

      // 仲間：参加
      if (selectedEvent.join && selectedEvent.join.trim() !== "") {
        const friendName = selectedEvent.join.trim();
        if (!newCompanions.includes(friendName)) {
          newCompanions.push(friendName);
        }
      }

      // 仲間：離脱
      if (selectedEvent.leave && selectedEvent.leave.trim() !== "") {
        const leaveName = selectedEvent.leave.trim();
        newCompanions = newCompanions.filter((c) => c !== leaveName);
      }
    }

    // state 反映
    setCurrentDay(updatedDay);
    setMoney(newMoney);
    setEmployment(newEmployment);
    setItems(newItems);
    setCompanions(newCompanions); // ← 追加
    setTurn((t) => t + 1);

    setLog((prev) => [
      {
        id: prev.length + 1,
        dice,
        day: updatedDay,
        ageYears: updatedAgeYears,
        ageDays: updatedAgeDays,
        moneyAfter: newMoney,
        employmentAfter: newEmployment,
        itemsAfter: newItems,
        companionsAfter: newCompanions, // ← 追加
        event: selectedEvent,
      },
      ...prev,
    ]);

    setRolling(false);
  };

  const handleReset = () => {
    setCurrentDay(0);
    setMoney(0);
    setEmployment(null);
    setItems([]);
    setCompanions([]);
    setLog([]);
    setTurn(0);
    setFinished(false);
    setRolling(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* タイトル */}
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Life game
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            サイコロの目だけ日数が進み、年齢に応じたイベントで
            所持金・職業・アイテムが変化していきます。
          </Typography>
        </Box>

        {/* ステータス + 操作 */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                ステータス
              </Typography>
              <Stack spacing={1}>
                <Typography>ターン: {turn}</Typography>
                <Typography>
                  年齢: {ageYears}歳 {ageDays}日（{currentDay}日経過）
                </Typography>
                <Typography>
                  所持金:{" "}
                  <Box component="span" fontWeight="bold">
                    {money.toLocaleString()} 円
                  </Box>
                </Typography>
                <Typography>
                  職業:{" "}
                  <Box component="span" fontWeight="bold">
                    {employment ?? "（なし）"}
                  </Box>
                </Typography>

                {/* アイテム */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>アイテム:</Typography>
                  {items.length === 0 ? (
                    <Typography color="text.secondary">（なし）</Typography>
                  ) : (
                    items.map((item) => (
                      <Chip
                        key={item}
                        label={item}
                        size="small"
                        color="secondary"
                      />
                    ))
                  )}
                </Stack>

                {/* 仲間 */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>仲間:</Typography>
                  {companions.length === 0 ? (
                    <Typography color="text.secondary">（なし）</Typography>
                  ) : (
                    companions.map((c) => (
                      <Chip key={c} label={c} size="small" color="primary" />
                    ))
                  )}
                </Stack>

                {finished && (
                  <Typography color="error" fontWeight="bold" mt={1}>
                    30歳に到達しました。ゲーム終了です。
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom>
                操作
              </Typography>

              {/* サイコロボタン（アニメーション付き） */}
              <motion.div
                animate={
                  rolling
                    ? { rotate: [0, 20, -20, 10, -10, 0], scale: 1.1 }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CasinoIcon />}
                  onClick={handleRollDice}
                  disabled={!canRoll}
                  sx={{ minWidth: 200, mb: 2 }}
                >
                  {rolling ? "サイコロを振っています..." : "サイコロを振る"}
                </Button>
              </motion.div>

              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton color="inherit" onClick={handleReset}>
                  <RestartAltIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  状態をリセット
                </Typography>
              </Stack>

              <Divider sx={{ my: 2, width: "100%" }} />

              <Typography variant="body2" color="text.secondary">
                サイコロの目 = 進む日数 です。
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ログ一覧 */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            イベントログ
          </Typography>
          {log.length === 0 ? (
            <Typography color="text.secondary">
              まだイベントは発生していません。
            </Typography>
          ) : (
            <List>
              {log.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem alignItems="flex-start" divider>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`ターン ${item.id}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2" color="text.secondary">
                            サイコロ: {item.dice}
                          </Typography>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: "div" }} // ← これで <div> ラップにする
                      secondary={
                        <Box mt={1}>
                          <Typography variant="body2">
                            年齢: {item.ageYears}歳 {item.ageDays}日（{item.day}
                            日経過）
                          </Typography>
                          <Typography variant="body2">
                            所持金: {item.moneyAfter.toLocaleString()} 円
                          </Typography>
                          <Typography variant="body2">
                            職業: {item.employmentAfter ?? "（なし）"}
                          </Typography>
                          <Typography variant="body2">
                            アイテム:
                            {item.itemsAfter.length === 0
                              ? " （なし）"
                              : " " + item.itemsAfter.join(" / ")}
                          </Typography>
                          <Typography variant="body2">
                            仲間:
                            {item.companionsAfter.length === 0
                              ? " （なし）"
                              : " " + item.companionsAfter.join(" / ")}
                          </Typography>

                          {item.event && (
                            <Box mt={1}>
                              <Typography variant="subtitle2">
                                イベント: {item.event.title}
                              </Typography>
                              <Typography variant="body2">
                                お金の増減:{" "}
                                {item.event.money >= 0
                                  ? `+${item.event.money.toLocaleString()} 円`
                                  : `${item.event.money.toLocaleString()} 円`}
                              </Typography>

                              {/* 職変化 */}
                              {item.event.employment &&
                                item.event.employment.trim() !== "" && (
                                  <Typography variant="body2">
                                    就いた職: {item.event.employment.trim()}
                                  </Typography>
                                )}
                              {item.event.unemployment && (
                                <Typography variant="body2">
                                  職を失いました
                                </Typography>
                              )}

                              {/* アイテム変化 */}
                              {item.event.get &&
                                item.event.get.trim() !== "" && (
                                  <Typography variant="body2">
                                    取得アイテム: {item.event.get.trim()}
                                  </Typography>
                                )}
                              {item.event.lost &&
                                item.event.lost.trim() !== "" && (
                                  <Typography variant="body2">
                                    失ったアイテム: {item.event.lost.trim()}
                                  </Typography>
                                )}

                              {/* 仲間変化 */}
                              {item.event.join &&
                                item.event.join.trim() !== "" && (
                                  <Typography variant="body2">
                                    仲間になった: {item.event.join.trim()}
                                  </Typography>
                                )}
                              {item.event.leave &&
                                item.event.leave.trim() !== "" && (
                                  <Typography variant="body2">
                                    離れていった仲間: {item.event.leave.trim()}
                                  </Typography>
                                )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
