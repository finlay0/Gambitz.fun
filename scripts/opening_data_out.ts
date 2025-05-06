const openings = [
  {
    "eco": "A00",
    "name": "Amar Opening",
    "pgn": "1.Nh3 d5 2.g3 e5 3.f4 Bxh3 4.Bxh3 exf4 ",
    "ecos": [
      "A00"
    ],
    "variant": "Gambit"
  },
  {
    "eco": "A01",
    "name": "Nimzovich-Larsen Attack",
    "pgn": "1.b3 Nf6 ",
    "ecos": [
      "A01"
    ],
    "variant": "Indian Variation"
  },
  {
    "eco": "A02",
    "name": "Bird's Opening",
    "pgn": "1.f4 e5 2.fxe5 d6 3.exd6 Bxd6 4.Nf3 Nh6 5.d4 ",
    "ecos": [
      "A02"
    ],
    "variant": "From Gambit,  Lipke Variation"
  },
  {
    "eco": "A03",
    "name": "Bird's Opening",
    "pgn": "1.f4 d5 2.Nf3 Nf6 3.e3 c5 ",
    "ecos": [
      "A03"
    ],
    "variant": "Lasker Variation"
  },
  {
    "eco": "A08",
    "name": "King's Indian Attack",
    "pgn": "1.Nf3 d5 2.g3 c5 3.Bg2 ",
    "ecos": [
      "A04",
      "A05",
      "A06"
    ],
    "variant": "Reti Opening"
  },
  {
    "eco": "A07",
    "name": "King's Indian Attack",
    "pgn": "1.Nf3 d5 2.g3 g6 3.Bg2 Bg7 4.O-O e5 5.d3 Ne7 ",
    "ecos": [
      "A07"
    ],
    "variant": "Reti Opening,  Pachman System"
  },
  {
    "eco": "A08",
    "name": "King's Indian Attack",
    "pgn": "1.Nf3 d5 2.g3 c5 3.Bg2 Nc6 4.O-O e6 5.d3 Nf6 6.Nbd2 Be7 7.e4 O-O 8.Re1 ",
    "ecos": [
      "A08"
    ],
    "variant": "Reti Opening,  French Variation"
  },
  {
    "eco": "A09",
    "name": "King's Indian Attack",
    "pgn": "1.Nf3 d5 2.c4 dxc4 3.e3 Be6 ",
    "ecos": [
      "A09"
    ],
    "variant": "Reti Opening,  Accepted,  Keres Variation"
  },
  {
    "eco": "A21",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 d6 3.Nf3 ",
    "ecos": [
      "A10",
      "A15",
      "A20"
    ]
  },
  {
    "eco": "A12",
    "name": "English Opening",
    "pgn": "1.c4 c6 2.Nf3 d5 3.b3 Nf6 4.Bb2 ",
    "ecos": [
      "A11"
    ],
    "variant": "Caro-Kann defensive System"
  },
  {
    "eco": "A12",
    "name": "English Opening",
    "pgn": "1.c4 c6 2.Nf3 d5 3.b3 Nf6 4.Bb2 Bf5 ",
    "ecos": [
      "A12"
    ],
    "variant": "New York (London) defensive System"
  },
  {
    "eco": "A13",
    "name": "English Opening",
    "pgn": "1.c4 e6 2.Nf3 d5 3.b3 Nf6 4.Bb2 c5 5.e3 ",
    "ecos": [
      "A13"
    ],
    "variant": "Wimpey System"
  },
  {
    "eco": "A14",
    "name": "English Opening",
    "pgn": "1.c4 e6 2.Nf3 d5 3.g3 Nf6 4.Bg2 Be7 5.O-O c5 6.cxd5 Nxd5 7.Nc3 Nc6 ",
    "ecos": [
      "A14"
    ],
    "variant": "Symmetrical,  Keres Defence"
  },
  {
    "eco": "A16",
    "name": "English Opening",
    "pgn": "1.c4 Nf6 2.Nc3 d5 3.cxd5 Nxd5 4.Nf3 g6 5.g3 Bg7 6.Bg2 e5 ",
    "ecos": [
      "A16"
    ],
    "variant": "Anglo-Gruenfeld Defence,  Korchnoi Variation"
  },
  {
    "eco": "A17",
    "name": "English Opening",
    "pgn": "1.c4 Nf6 2.Nc3 e6 3.Nf3 b6 4.e4 Bb7 5.Bd3 ",
    "ecos": [
      "A17"
    ],
    "variant": "Queen's Indian,  Romanishin Variation"
  },
  {
    "eco": "A18",
    "name": "English Opening",
    "pgn": "1.c4 Nf6 2.Nc3 e6 3.e4 d5 4.e5 ",
    "ecos": [
      "A18"
    ],
    "variant": "Mikenas-Carls,  Flohr Variation"
  },
  {
    "eco": "A19",
    "name": "English Opening",
    "pgn": "1.c4 Nf6 2.Nc3 e6 3.e4 c5 ",
    "ecos": [
      "A19"
    ],
    "variant": "Mikenas-Carls,  Sicilian Variation"
  },
  {
    "eco": "A21",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 d6 3.g3 Be6 4.Bg2 Nc6 ",
    "ecos": [
      "A21"
    ],
    "variant": "Troeger Defence"
  },
  {
    "eco": "A22",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nf6 3.Nf3 e4 4.Ng5 b5 ",
    "ecos": [
      "A22"
    ],
    "variant": "Bellon Gambit"
  },
  {
    "eco": "A23",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nf6 3.g3 c6 ",
    "ecos": [
      "A23"
    ],
    "variant": "Bremen System,  Keres Variation"
  },
  {
    "eco": "A24",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nf6 3.g3 g6 ",
    "ecos": [
      "A24"
    ],
    "variant": "Bremen System,  With ...g6"
  },
  {
    "eco": "A25",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.e3 d6 6.Nge2 Nh6 ",
    "ecos": [
      "A25"
    ],
    "variant": "Closed,  Taimanov Variation"
  },
  {
    "eco": "A26",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.e4 ",
    "ecos": [
      "A26"
    ],
    "variant": "Botvinnik System"
  },
  {
    "eco": "A27",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nc6 3.Nf3 ",
    "ecos": [
      "A27"
    ],
    "variant": "three Knights System"
  },
  {
    "eco": "A28",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nc6 3.Nf3 Nf6 4.d4 exd4 5.Nxd4 Bb4 6.Bg5 h6 7.Bh4 Bxc3 8.bxc3 Ne5 ",
    "ecos": [
      "A28"
    ],
    "variant": "Nenarokov Variation"
  },
  {
    "eco": "A29",
    "name": "English Opening",
    "pgn": "1.c4 e5 2.Nc3 Nc6 3.Nf3 Nf6 4.g3 ",
    "ecos": [
      "A29"
    ],
    "variant": "Four Knights,  kingside Fianchetto"
  },
  {
    "eco": "A33",
    "name": "English Opening",
    "pgn": "1.c4 c5 2.Nf3 Nf6 3.d4 cxd4 4.Nxd4 e6 5.Nc3 Nc6 ",
    "ecos": [
      "A32",
      "A34",
      "A35",
      "A36",
      "A37"
    ],
    "variant": "Symmetrical Variation"
  },
  {
    "eco": "A30",
    "name": "English Opening",
    "pgn": "1.c4 c5 2.Nf3 Nf6 3.g3 b6 4.Bg2 Bb7 5.O-O e6 6.Nc3 Be7 7.d4 cxd4 8.Qxd4 d6 9.Rd1 a6 10.b3 Nbd7 ",
    "ecos": [
      "A30"
    ],
    "variant": "Symmetrical Variation,  hedgehog,  flexible formation"
  },
  {
    "eco": "A31",
    "name": "English Opening",
    "pgn": "1.c4 c5 2.Nf3 Nf6 3.d4 ",
    "ecos": [
      "A31"
    ],
    "variant": "Symmetrical Variation,  Benoni formation"
  },
  {
    "eco": "A33",
    "name": "English Opening",
    "pgn": "1.c4 c5 2.Nf3 Nf6 3.d4 cxd4 4.Nxd4 e6 5.Nc3 Nc6 6.g3 Qb6 ",
    "ecos": [
      "A33"
    ],
    "variant": "Symmetrical Variation,  Geller Variation"
  },
  {
    "eco": "A38",
    "name": "English Opening",
    "pgn": "1.c4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.Nf3 Nf6 6.O-O O-O 7.d3 ",
    "ecos": [
      "A38"
    ],
    "variant": "Symmetrical Variation,  Main line With d3"
  },
  {
    "eco": "A39",
    "name": "English Opening",
    "pgn": "1.c4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.Nf3 Nf6 6.O-O O-O 7.d4 ",
    "ecos": [
      "A39"
    ],
    "variant": "Symmetrical Variation,  Main line With d4"
  },
  {
    "eco": "D05",
    "name": "Queen's Pawn Game",
    "pgn": "1.d4 d5 2.Nf3 Nf6 3.e3 e6 4.Bd3 ",
    "ecos": [
      "A45",
      "A46",
      "A50",
      "D02",
      "D04",
      "E00"
    ]
  },
  {
    "eco": "A40",
    "name": "Queen's Pawn Game",
    "pgn": "1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Qd5 f6 5.exf6 Nxf6 ",
    "ecos": [
      "A40"
    ],
    "variant": "Englund Gambit"
  },
  {
    "eco": "A41",
    "name": "Robatsch Defence",
    "pgn": "1.e4 g6 2.d4 Bg7 3.Nf3 d6 4.c4 Bg4 ",
    "ecos": [
      "A41"
    ],
    "variant": "Rossolimo Variation"
  },
  {
    "eco": "A42",
    "name": "Pterodactyl Defence",
    "pgn": "1.d4 d6 2.c4 g6 3.Nc3 Bg7 4.e4 c5 5.Nf3 Qa5 ",
    "ecos": [
      "A42"
    ]
  },
  {
    "eco": "A43",
    "name": "Woozle Defence",
    "pgn": "1.d4 c5 2.d5 Nf6 3.Nc3 Qa5 ",
    "ecos": [
      "A43"
    ]
  },
  {
    "eco": "A44",
    "name": "Semi-Benoni",
    "pgn": "1.d4 c5 2.d5 e5 3.e4 d6 ",
    "ecos": [
      "A44"
    ]
  },
  {
    "eco": "A47",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.Nf3 b6 3.g3 Bb7 4.Bg2 c5 5.c4 cxd4 6.Qxd4 ",
    "ecos": [
      "A47"
    ],
    "variant": "Marienbad System,  Berg Variation"
  },
  {
    "eco": "A48",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.Nf3 g6 3.Bg5 ",
    "ecos": [
      "A48"
    ],
    "variant": "Torre Attack"
  },
  {
    "eco": "A49",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.Nf3 g6 3.g3 ",
    "ecos": [
      "A49"
    ],
    "variant": "Fianchetto Without c4"
  },
  {
    "eco": "A51",
    "name": "Budapest Defence",
    "pgn": "1.d4 Nf6 2.c4 e5 3.dxe5 Ne4 4.Qc2 ",
    "ecos": [
      "A51"
    ],
    "variant": "Fajarowicz Variation,  Steiner Variation"
  },
  {
    "eco": "A52",
    "name": "Budapest Defence",
    "pgn": "1.d4 Nf6 2.c4 e5 3.dxe5 Ng4 4.e4 Nxe5 5.f4 Nec6 ",
    "ecos": [
      "A52"
    ],
    "variant": "Alekhine,  Abonyi Variation"
  },
  {
    "eco": "A53",
    "name": "Old Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 d6 3.Nc3 Bf5 ",
    "ecos": [
      "A53"
    ],
    "variant": "Janowski Variation"
  },
  {
    "eco": "A54",
    "name": "Old Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 d6 3.Nc3 e5 4.e3 Nbd7 5.Bd3 ",
    "ecos": [
      "A54"
    ],
    "variant": "Dus-Khotimirsky Variation"
  },
  {
    "eco": "A55",
    "name": "Old Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 d6 3.Nc3 e5 4.Nf3 Nbd7 5.e4 ",
    "ecos": [
      "A55"
    ],
    "variant": "Main line"
  },
  {
    "eco": "A61",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.Nf3 g6 ",
    "ecos": [
      "A56",
      "A60"
    ]
  },
  {
    "eco": "A59",
    "name": "Benko Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 b5 4.cxb5 a6 5.bxa6 Bxa6 6.Nc3 d6 7.e4 Bxf1 8.Kxf1 g6 9.g3 ",
    "ecos": [
      "A57"
    ],
    "variant": "Gambit"
  },
  {
    "eco": "A58",
    "name": "Benko Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 b5 4.cxb5 a6 5.bxa6 Bxa6 6.Nc3 d6 7.Nf3 g6 8.Nd2 ",
    "ecos": [
      "A58"
    ],
    "variant": "Gambit,  Nd2 Variation"
  },
  {
    "eco": "A59",
    "name": "Benko Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 b5 4.cxb5 a6 5.bxa6 Bxa6 6.Nc3 d6 7.e4 Bxf1 8.Kxf1 g6 9.g3 Bg7 10.Kg2 O-O 11.Nf3 ",
    "ecos": [
      "A59"
    ],
    "variant": "Gambit,  Main line"
  },
  {
    "eco": "A62",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.Nf3 g6 7.g3 Bg7 8.Bg2 O-O ",
    "ecos": [
      "A61",
      "A62"
    ],
    "variant": "Fianchetto Variation"
  },
  {
    "eco": "A63",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.Nf3 g6 7.g3 Bg7 8.Bg2 O-O 9.O-O Nbd7 ",
    "ecos": [
      "A63"
    ],
    "variant": "Fianchetto,  9...Nbd7"
  },
  {
    "eco": "A64",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.Nf3 g6 7.g3 Bg7 8.Bg2 O-O 9.O-O Nbd7 10.Nd2 a6 11.a4 Re8 ",
    "ecos": [
      "A64"
    ],
    "variant": "Fianchetto,  11...Re8"
  },
  {
    "eco": "A65",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 ",
    "ecos": [
      "A65"
    ],
    "variant": "6.e4"
  },
  {
    "eco": "A66",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.f4 Bg7 8.e5 ",
    "ecos": [
      "A66"
    ],
    "variant": "Mikenas Variation"
  },
  {
    "eco": "A67",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.f4 Bg7 8.Bb5 ",
    "ecos": [
      "A67"
    ],
    "variant": "Taimanov Variation"
  },
  {
    "eco": "A68",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.f4 Bg7 8.Nf3 O-O ",
    "ecos": [
      "A68"
    ],
    "variant": "Four Pawns Attack"
  },
  {
    "eco": "A69",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.f4 Bg7 8.Nf3 O-O 9.Be2 Re8 ",
    "ecos": [
      "A69"
    ],
    "variant": "Four Pawns Attack,  Main line"
  },
  {
    "eco": "A72",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O ",
    "ecos": [
      "A70",
      "A72"
    ],
    "variant": "Classical Without 9.O-O"
  },
  {
    "eco": "A71",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Bg5 ",
    "ecos": [
      "A71"
    ],
    "variant": "Classical,  8.Bg5"
  },
  {
    "eco": "A73",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O ",
    "ecos": [
      "A73"
    ],
    "variant": "Classical,  9.O-O"
  },
  {
    "eco": "A74",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O a6 10.a4 ",
    "ecos": [
      "A74"
    ],
    "variant": "Classical,  9...a6,  10.a4"
  },
  {
    "eco": "A75",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O a6 10.a4 Bg4 ",
    "ecos": [
      "A75"
    ],
    "variant": "Classical With ...a6 and 10...Bg4"
  },
  {
    "eco": "A76",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O Re8 ",
    "ecos": [
      "A76"
    ],
    "variant": "Classical,  9...Re8"
  },
  {
    "eco": "A77",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O Re8 10.Nd2 ",
    "ecos": [
      "A77"
    ],
    "variant": "Classical,  9...Re8,  10.Nd2"
  },
  {
    "eco": "A78",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O Re8 10.Nd2 Na6 ",
    "ecos": [
      "A78"
    ],
    "variant": "Classical With ...Re8 and ...Na6"
  },
  {
    "eco": "A79",
    "name": "Benoni Defence",
    "pgn": "1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5 5.cxd5 d6 6.e4 g6 7.Nf3 Bg7 8.Be2 O-O 9.O-O Re8 10.Nd2 Na6 11.f3 ",
    "ecos": [
      "A79"
    ],
    "variant": "Classical,  11.f3"
  },
  {
    "eco": "A92",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O ",
    "ecos": [
      "A80",
      "A81",
      "A84",
      "A90",
      "A91"
    ]
  },
  {
    "eco": "A82",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.e4 fxe4 3.Nc3 Nf6 4.g4 ",
    "ecos": [
      "A82"
    ],
    "variant": "Staunton Gambit,  Tartakower Variation"
  },
  {
    "eco": "A83",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.e4 fxe4 3.Nc3 Nf6 4.Bg5 g6 5.h4 ",
    "ecos": [
      "A83"
    ],
    "variant": "Staunton Gambit,  Alekhine Variation"
  },
  {
    "eco": "A85",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.Nc3 ",
    "ecos": [
      "A85"
    ],
    "variant": " With c4 & Nc3"
  },
  {
    "eco": "A86",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 d6 4.Bg2 c6 5.Nc3 Qc7 ",
    "ecos": [
      "A86"
    ],
    "variant": "Hort-Antoshin System"
  },
  {
    "eco": "A87",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 g6 4.Bg2 Bg7 5.Nf3 ",
    "ecos": [
      "A87"
    ],
    "variant": "Leningrad,  main Variation"
  },
  {
    "eco": "A88",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 g6 4.Bg2 Bg7 5.Nf3 O-O 6.O-O d6 7.Nc3 c6 ",
    "ecos": [
      "A88"
    ],
    "variant": "Leningrad,  main Variation With c6"
  },
  {
    "eco": "A89",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 g6 4.Bg2 Bg7 5.Nf3 O-O 6.O-O d6 7.Nc3 Nc6 ",
    "ecos": [
      "A89"
    ],
    "variant": "Leningrad,  main Variation With Nc6"
  },
  {
    "eco": "A95",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d5 7.Nc3 c6 ",
    "ecos": [
      "A92"
    ],
    "variant": "Stonewall With Nc3"
  },
  {
    "eco": "A93",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d5 7.b3 ",
    "ecos": [
      "A93"
    ],
    "variant": "Stonewall,  Botvinnik Variation"
  },
  {
    "eco": "A94",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d5 7.b3 c6 8.Ba3 ",
    "ecos": [
      "A94"
    ],
    "variant": "Stonewall With Ba3"
  },
  {
    "eco": "A95",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d5 7.Nc3 c6 8.Qc2 Qe8 9.Bg5 ",
    "ecos": [
      "A95"
    ],
    "variant": "Stonewall: Chekhover Variation"
  },
  {
    "eco": "A96",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d6 ",
    "ecos": [
      "A96"
    ],
    "variant": "Classical Variation"
  },
  {
    "eco": "A97",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d6 7.Nc3 Qe8 8.Re1 ",
    "ecos": [
      "A97"
    ],
    "variant": "Ilyin-Genevsky,  Winter Variation"
  },
  {
    "eco": "A98",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d6 7.Nc3 Qe8 8.Qc2 ",
    "ecos": [
      "A98"
    ],
    "variant": "Ilyin-Genevsky Variation With Qc2"
  },
  {
    "eco": "A99",
    "name": "Dutch Defence",
    "pgn": "1.d4 f5 2.c4 Nf6 3.g3 e6 4.Bg2 Be7 5.Nf3 O-O 6.O-O d6 7.Nc3 Qe8 8.b3 ",
    "ecos": [
      "A99"
    ],
    "variant": "Ilyin-Genevsky Variation With b3"
  },
  {
    "eco": "C44",
    "name": "King's Pawn Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 ",
    "ecos": [
      "C20"
    ]
  },
  {
    "eco": "B00",
    "name": "King's Pawn Game",
    "pgn": "1.e4 Nc6 2.d4 d5 3.exd5 Qxd5 4.Nc3 ",
    "ecos": [
      "B00"
    ],
    "variant": "Nimzovich Defence,  Marshall Gambit"
  },
  {
    "eco": "B01",
    "name": "Scandinavian Defence",
    "pgn": "1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5 4.d4 e5 5.dxe5 Bb4 6.Bd2 Nc6 7.Nf3 ",
    "ecos": [
      "B01"
    ],
    "variant": "Anderssen Counter-attack,  Orthodox Attack"
  },
  {
    "eco": "B02",
    "name": "Alekhine's Defence",
    "pgn": "1.e4 Nf6 2.e5 Nd5 3.c4 Nb6 4.c5 Nd5 5.Bc4 e6 6.Nc3 d6 ",
    "ecos": [
      "B02"
    ],
    "variant": "Two Pawns' Attack,  Mikenas Variation"
  },
  {
    "eco": "B03",
    "name": "Alekhine's Defence",
    "pgn": "1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.c4 Nb6 5.f4 dxe5 6.fxe5 Nc6 7.Be3 Bf5 8.Nc3 e6 9.Nf3 Qd7 10.Be2 O-O-O 11.O-O Be7 ",
    "ecos": [
      "B03"
    ],
    "variant": "Four Pawns Attack,  Tartakower Variation"
  },
  {
    "eco": "B04",
    "name": "Alekhine's Defence",
    "pgn": "1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 g6 5.Bc4 Nb6 6.Bb3 Bg7 7.a4 ",
    "ecos": [
      "B04"
    ],
    "variant": "Modern,  Keres Variation"
  },
  {
    "eco": "B05",
    "name": "Alekhine's Defence",
    "pgn": "1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.c4 Nb6 6.d5 ",
    "ecos": [
      "B05"
    ],
    "variant": "Modern,  Vitolins Attack"
  },
  {
    "eco": "B06",
    "name": "Robatsch Defence",
    "pgn": "1.e4 g6 2.d4 Bg7 3.Nc3 c6 4.f4 d5 5.e5 h5 ",
    "ecos": [
      "B06"
    ],
    "variant": "Gurgenidze Variation"
  },
  {
    "eco": "B07",
    "name": "Pirc Defence",
    "pgn": "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Be3 c6 5.Qd2 ",
    "ecos": [
      "B07"
    ],
    "variant": "150 Attack"
  },
  {
    "eco": "B08",
    "name": "Pirc Defence",
    "pgn": "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Nf3 Bg7 5.Be2 ",
    "ecos": [
      "B08"
    ],
    "variant": "Classical System,  5.Be2"
  },
  {
    "eco": "B09",
    "name": "Pirc Defence",
    "pgn": "1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.f4 Bg7 5.Nf3 O-O 6.Be3 ",
    "ecos": [
      "B09"
    ],
    "variant": "Austrian Attack,  6.Be3"
  },
  {
    "eco": "B15",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 ",
    "ecos": [
      "B10"
    ]
  },
  {
    "eco": "B11",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.Nc3 d5 3.Nf3 Bg4 ",
    "ecos": [
      "B11"
    ],
    "variant": "Two Knights,  3...Bg4"
  },
  {
    "eco": "B15",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nf6 5.Nxf6 exf6 ",
    "ecos": [
      "B12"
    ],
    "variant": "Tartakower Variation"
  },
  {
    "eco": "B13",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4 Nf6 5.Nc3 Nc6 6.Bg5 dxc4 7.d5 Na5 ",
    "ecos": [
      "B13"
    ],
    "variant": "Panov-Botvinnik Attack,  Herzog Defence"
  },
  {
    "eco": "B14",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.exd5 cxd5 4.c4 Nf6 5.Nc3 e6 ",
    "ecos": [
      "B14"
    ],
    "variant": "Panov-Botvinnik Attack,  5...e6"
  },
  {
    "eco": "B15",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nf6 5.Nxf6 exf6 6.Bc4 ",
    "ecos": [
      "B15"
    ],
    "variant": "Forgacs Variation"
  },
  {
    "eco": "B16",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nf6 5.Nxf6 gxf6 ",
    "ecos": [
      "B16"
    ],
    "variant": "Bronstein-Larsen Variation"
  },
  {
    "eco": "B17",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 ",
    "ecos": [
      "B17"
    ],
    "variant": "Steinitz Variation"
  },
  {
    "eco": "B18",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.Nh3 ",
    "ecos": [
      "B18"
    ],
    "variant": "Classical Variation,  Flohr Variation"
  },
  {
    "eco": "B19",
    "name": "Caro-Kann Defence",
    "pgn": "1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3 Bg6 6.h4 h6 7.Nf3 Nd7 8.h5 ",
    "ecos": [
      "B19"
    ],
    "variant": "Classical Variation,  Spassky Variation"
  },
  {
    "eco": "B56",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 ",
    "ecos": [
      "B20",
      "B27",
      "B30",
      "B32",
      "B50",
      "B54"
    ]
  },
  {
    "eco": "B21",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nxc3 Nc6 5.Nf3 d6 6.Bc4 e6 7.O-O a6 8.Qe2 b5 9.Bb3 Ra7 ",
    "ecos": [
      "B21"
    ],
    "variant": "Smith-Morra Gambit,  Chicago Defence"
  },
  {
    "eco": "B22",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.c3 Nf6 3.e5 Nd5 4.Nf3 Nc6 5.Na3 ",
    "ecos": [
      "B22"
    ],
    "variant": "Alapin Variation,  Heidenfeld Variation"
  },
  {
    "eco": "B23",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nc3 Nc6 3.f4 g6 4.Nf3 Bg7 5.Bc4 e6 6.f5 ",
    "ecos": [
      "B23"
    ],
    "variant": "Grand Prix Attack,  Schofman Variation"
  },
  {
    "eco": "B24",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 e6 6.Be3 Nd4 7.Nce2 ",
    "ecos": [
      "B24"
    ],
    "variant": "Closed,  Smyslov Variation"
  },
  {
    "eco": "B25",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.Nge2 e5 ",
    "ecos": [
      "B25"
    ],
    "variant": "Closed,  6.Ne2 e5 (Botvinnik)"
  },
  {
    "eco": "B26",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nc3 Nc6 3.g3 g6 4.Bg2 Bg7 5.d3 d6 6.Be3 ",
    "ecos": [
      "B26"
    ],
    "variant": "Closed,  6.Be3"
  },
  {
    "eco": "B28",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 a6 ",
    "ecos": [
      "B28"
    ],
    "variant": "O'Kelly Variation"
  },
  {
    "eco": "B29",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nf6 3.e5 Nd5 4.Nc3 e6 5.Nxd5 exd5 6.d4 Nc6 ",
    "ecos": [
      "B29"
    ],
    "variant": "Nimzovich-Rubinstein Variation,  Rubinstein Counter-Gambit"
  },
  {
    "eco": "B31",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.Bb5 g6 4.O-O Bg7 5.Re1 e5 6.b4 ",
    "ecos": [
      "B31"
    ],
    "variant": "Nimzovich-Rossolimo Attack,  Gurgenidze Variation"
  },
  {
    "eco": "B33",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e5 6.Ndb5 d6 7.Bg5 a6 8.Na3 b5 9.Bxf6 gxf6 10.Nd5 f5 ",
    "ecos": [
      "B33"
    ],
    "variant": "Sveshnikov Variation"
  },
  {
    "eco": "B34",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6 5.Nxc6 ",
    "ecos": [
      "B34"
    ],
    "variant": "Accelerated Fianchetto,  Exchange Variation"
  },
  {
    "eco": "B35",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6 5.Nc3 Bg7 6.Be3 Nf6 7.Bc4 ",
    "ecos": [
      "B35"
    ],
    "variant": "Accelerated Fianchetto,  Modern Variation With Bc4"
  },
  {
    "eco": "B36",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6 5.c4 Nf6 6.Nc3 Nxd4 7.Qxd4 d6 ",
    "ecos": [
      "B36"
    ],
    "variant": "Accelerated Fianchetto,  Gurgenidze Variation"
  },
  {
    "eco": "B37",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6 5.c4 Bg7 6.Nc2 d6 7.Be2 Nh6 ",
    "ecos": [
      "B37"
    ],
    "variant": "Accelerated Fianchetto,  Simagin Variation"
  },
  {
    "eco": "B38",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6 5.c4 Bg7 6.Be3 ",
    "ecos": [
      "B38"
    ],
    "variant": "Accelerated Fianchetto,  Maroczy bind,  6.Be3"
  },
  {
    "eco": "B39",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 g6 5.c4 Bg7 6.Be3 Nf6 7.Nc3 Ng4 ",
    "ecos": [
      "B39"
    ],
    "variant": "Accelerated Fianchetto,  Breyer Variation"
  },
  {
    "eco": "B40",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Bb4 6.Bd3 e5 ",
    "ecos": [
      "B40"
    ],
    "variant": "Pin Variation,  Jaffe Variation"
  },
  {
    "eco": "B41",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6 5.c4 Nf6 6.Nc3 Bb4 7.Bd3 Nc6 8.Bc2 ",
    "ecos": [
      "B41"
    ],
    "variant": "Kan Variation,  Maroczy bind,  Bronstein Variation"
  },
  {
    "eco": "B42",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6 5.Bd3 Nf6 6.O-O d6 7.c4 g6 ",
    "ecos": [
      "B42"
    ],
    "variant": "Kan Variation,  Gipslis Variation"
  },
  {
    "eco": "B43",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 a6 5.Nc3 ",
    "ecos": [
      "B43"
    ],
    "variant": "Kan Variation,  5.Nc3"
  },
  {
    "eco": "B44",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nb5 d6 6.c4 Nf6 7.N1c3 a6 8.Na3 Be7 9.Be2 O-O 10.O-O b6 ",
    "ecos": [
      "B44"
    ],
    "variant": "Szen Variation,  Hedgehog Variation"
  },
  {
    "eco": "B49",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nc3 Qc7 6.Be3 a6 7.Be2 ",
    "ecos": [
      "B46",
      "B47",
      "B48",
      "B49"
    ],
    "variant": "Taimanov Variation"
  },
  {
    "eco": "B45",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nc3 Nf6 6.Ndb5 Bb4 7.Nd6 ",
    "ecos": [
      "B45"
    ],
    "variant": "Taimanov Variation,  American Attack"
  },
  {
    "eco": "B51",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.Bb5 ",
    "ecos": [
      "B51"
    ],
    "variant": "Canal-Sokolsky Attack"
  },
  {
    "eco": "B52",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.Bb5 Bd7 4.Bxd7 Qxd7 5.O-O Nc6 6.c3 Nf6 7.d4 ",
    "ecos": [
      "B52"
    ],
    "variant": "Canal-Sokolsky Attack,  Bronstein Gambit"
  },
  {
    "eco": "B53",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Qxd4 Nc6 5.Bb5 Qd7 ",
    "ecos": [
      "B53"
    ],
    "variant": "Chekhover Variation,  Zaitsev Variation"
  },
  {
    "eco": "B55",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.f3 e5 6.Bb5 ",
    "ecos": [
      "B55"
    ],
    "variant": "Prins Variation,  Venice Attack"
  },
  {
    "eco": "B56",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e5 6.Bb5 ",
    "ecos": [
      "B56"
    ],
    "variant": "Venice Attack"
  },
  {
    "eco": "B57",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bc4 g6 7.Nxc6 bxc6 8.e5 ",
    "ecos": [
      "B57"
    ],
    "variant": "Magnus Smith trap"
  },
  {
    "eco": "B58",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 d6 6.Be2 e5 7.Nxc6 ",
    "ecos": [
      "B58"
    ],
    "variant": "Boleslavsky Variation,  Louma Variation"
  },
  {
    "eco": "B59",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 d6 6.Be2 e5 7.Nb3 ",
    "ecos": [
      "B59"
    ],
    "variant": "Boleslavsky Variation,  7.Nb3"
  },
  {
    "eco": "B60",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 Bd7 ",
    "ecos": [
      "B60"
    ],
    "variant": "Richter-Rauzer,  Larsen Variation"
  },
  {
    "eco": "B61",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 Bd7 7.Qd2 ",
    "ecos": [
      "B61"
    ],
    "variant": "Richter-Rauzer,  Larsen Variation,  7.Qd2"
  },
  {
    "eco": "B62",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Nxc6 ",
    "ecos": [
      "B62"
    ],
    "variant": "Richter-Rauzer,  Richter Attack"
  },
  {
    "eco": "B63",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 Be7 ",
    "ecos": [
      "B63"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  7...Be7"
  },
  {
    "eco": "B64",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 Be7 8.O-O-O O-O 9.f4 e5 ",
    "ecos": [
      "B64"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  Geller Variation"
  },
  {
    "eco": "B65",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 Be7 8.O-O-O O-O 9.f4 Nxd4 10.Qxd4 ",
    "ecos": [
      "B65"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  7...Be7 Defence,  9...Nxd4"
  },
  {
    "eco": "B66",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 a6 ",
    "ecos": [
      "B66"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  7...a6"
  },
  {
    "eco": "B67",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 a6 8.O-O-O Bd7 ",
    "ecos": [
      "B67"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  7...a6 Defence,  8...Bd7"
  },
  {
    "eco": "B68",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 a6 8.O-O-O Bd7 9.f4 Be7 ",
    "ecos": [
      "B68"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  7...a6 Defence,  9...Be7"
  },
  {
    "eco": "B69",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 Nc6 6.Bg5 e6 7.Qd2 a6 8.O-O-O Bd7 9.f4 Be7 10.Nf3 b5 11.Bxf6 ",
    "ecos": [
      "B69"
    ],
    "variant": "Richter-Rauzer,  Rauzer Attack,  7...a6 Defence,  11.Bxf6"
  },
  {
    "eco": "B70",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 ",
    "ecos": [
      "B70"
    ],
    "variant": "Dragon Variation"
  },
  {
    "eco": "B71",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.f4 Nbd7 ",
    "ecos": [
      "B71"
    ],
    "variant": "Dragon Variation,  Levenfish; Flohr Variation"
  },
  {
    "eco": "B72",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.Be2 Nc6 8.Qd2 O-O 9.O-O-O ",
    "ecos": [
      "B72"
    ],
    "variant": "Dragon Variation,  Classical Attack,  Grigoriev Variation"
  },
  {
    "eco": "B73",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.Be2 Nc6 8.O-O O-O 9.f4 Qb6 10.e5 ",
    "ecos": [
      "B73"
    ],
    "variant": "Dragon Variation,  Classical Attack,  Zollner Gambit"
  },
  {
    "eco": "B74",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.Be2 Nc6 8.O-O O-O 9.Nb3 Be6 10.f4 Na5 11.f5 Bc4 12.Nxa5 Bxe2 13.Qxe2 Qxa5 14.g4 ",
    "ecos": [
      "B74"
    ],
    "variant": "Dragon Variation,  Classical Attack,  Stockholm Attack"
  },
  {
    "eco": "B75",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 ",
    "ecos": [
      "B75"
    ],
    "variant": "Dragon Variation,  Yugoslav Attack"
  },
  {
    "eco": "B76",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.O-O-O ",
    "ecos": [
      "B76"
    ],
    "variant": "Dragon Variation,  Yugoslav Attack,  Rauser Variation"
  },
  {
    "eco": "B77",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 ",
    "ecos": [
      "B77"
    ],
    "variant": "Dragon Variation,  Yugoslav Attack,  9...Bd7"
  },
  {
    "eco": "B78",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 10.O-O-O ",
    "ecos": [
      "B78"
    ],
    "variant": "Dragon Variation,  Yugoslav Attack,  10.O-O-O"
  },
  {
    "eco": "B79",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6 6.Be3 Bg7 7.f3 O-O 8.Qd2 Nc6 9.Bc4 Bd7 10.O-O-O Qa5 11.Bb3 Rfc8 12.h4 ",
    "ecos": [
      "B79"
    ],
    "variant": "Dragon Variation,  Yugoslav Attack,  12.h4"
  },
  {
    "eco": "B80",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Be3 a6 7.Qd2 ",
    "ecos": [
      "B80"
    ],
    "variant": "Scheveningen Variation,  English Variation"
  },
  {
    "eco": "B81",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.g4 ",
    "ecos": [
      "B81"
    ],
    "variant": "Scheveningen Variation,  Keres Attack"
  },
  {
    "eco": "B82",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.f4 Nc6 7.Be3 Be7 8.Qf3 ",
    "ecos": [
      "B82"
    ],
    "variant": "Scheveningen Variation,  Tal Variation"
  },
  {
    "eco": "B83",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Be2 Nc6 7.O-O Be7 8.Be3 O-O 9.f4 Bd7 10.Nb3 ",
    "ecos": [
      "B83"
    ],
    "variant": "Modern Scheveningen Variation,  Main line With Nb3"
  },
  {
    "eco": "B85",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Be2 a6 7.O-O Qc7 8.f4 Nc6 9.Be3 Be7 10.Qe1 O-O ",
    "ecos": [
      "B84",
      "B85"
    ],
    "variant": "Scheveningen Variation,  Classical Variation"
  },
  {
    "eco": "B86",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Bc4 ",
    "ecos": [
      "B86"
    ],
    "variant": "Sozin Attack"
  },
  {
    "eco": "B87",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Bc4 a6 7.Bb3 b5 ",
    "ecos": [
      "B87"
    ],
    "variant": "Sozin Attack With ...a6 and ...b5"
  },
  {
    "eco": "B88",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Bc4 Nc6 7.Bb3 Be7 8.Be3 O-O 9.f4 ",
    "ecos": [
      "B88"
    ],
    "variant": "Sozin Attack,  Fischer Variation"
  },
  {
    "eco": "B89",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 e6 6.Bc4 Nc6 7.Be3 Be7 8.Qe2 ",
    "ecos": [
      "B89"
    ],
    "variant": "Velimirovic Attack"
  },
  {
    "eco": "B90",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bc4 ",
    "ecos": [
      "B90"
    ],
    "variant": "Najdorf Variation,  Lipnitzky Attack"
  },
  {
    "eco": "B91",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.g3 ",
    "ecos": [
      "B91"
    ],
    "variant": "Najdorf Variation,  Zagreb (Fianchetto) Variation"
  },
  {
    "eco": "B92",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be2 ",
    "ecos": [
      "B92"
    ],
    "variant": "Najdorf Variation,  Opovcensky Variation"
  },
  {
    "eco": "B93",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.f4 ",
    "ecos": [
      "B93"
    ],
    "variant": "Najdorf Variation,  6.f4"
  },
  {
    "eco": "B94",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 Nbd7 7.Bc4 Qa5 8.Qd2 e6 9.O-O-O b5 10.Bb3 Bb7 11.Rhe1 Nc5 12.e5 ",
    "ecos": [
      "B94"
    ],
    "variant": "Najdorf Variation,  Ivkov Variation"
  },
  {
    "eco": "B95",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 ",
    "ecos": [
      "B95"
    ],
    "variant": "Najdorf Variation,  6...e6"
  },
  {
    "eco": "B96",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 b5 8.e5 dxe5 9.fxe5 Qc7 10.Qe2 ",
    "ecos": [
      "B96"
    ],
    "variant": "Najdorf Variation,  Polugayevsky,  Simagin Variation"
  },
  {
    "eco": "B97",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 Qb6 8.Qd2 Qxb2 9.Rb1 Qa3 ",
    "ecos": [
      "B97"
    ],
    "variant": "Najdorf Variation,  Poisoned Pawn Variation"
  },
  {
    "eco": "B98",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 Be7 8.Qf3 h6 9.Bh4 Qc7 ",
    "ecos": [
      "B98"
    ],
    "variant": "Najdorf Variation,  Browne Variation"
  },
  {
    "eco": "B99",
    "name": "Sicilian Defence",
    "pgn": "1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Bg5 e6 7.f4 Be7 8.Qf3 Qc7 9.O-O-O Nbd7 ",
    "ecos": [
      "B99"
    ],
    "variant": "Najdorf Variation,  7...Be7 Main line"
  },
  {
    "eco": "C00",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d3 d5 3.Nd2 Nf6 4.Ngf3 Nc6 5.Be2 ",
    "ecos": [
      "C00"
    ],
    "variant": "Reversed Philidor formation"
  },
  {
    "eco": "C01",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.exd5 exd5 4.Nc3 Nf6 5.Bg5 Nc6 ",
    "ecos": [
      "C01"
    ],
    "variant": "Exchange Variation,  Bogolyubov Variation"
  },
  {
    "eco": "C02",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.e5 c5 4.c3 Nc6 5.Nf3 Qb6 6.Bd3 ",
    "ecos": [
      "C02"
    ],
    "variant": "Advance Variation,  Milner-Barry Gambit"
  },
  {
    "eco": "C03",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 Nc6 ",
    "ecos": [
      "C03"
    ],
    "variant": "Tarrasch,  Guimard Variation"
  },
  {
    "eco": "C04",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 Nc6 4.Ngf3 Nf6 ",
    "ecos": [
      "C04"
    ],
    "variant": "Tarrasch,  Guimard Main line"
  },
  {
    "eco": "C05",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 Nf6 4.e5 Nfd7 5.Bd3 c5 6.c3 Nc6 ",
    "ecos": [
      "C05"
    ],
    "variant": "Tarrasch,  closed Variation"
  },
  {
    "eco": "C06",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 Nf6 4.e5 Nfd7 5.Bd3 c5 6.c3 Nc6 7.Ne2 cxd4 8.cxd4 Nb6 ",
    "ecos": [
      "C06"
    ],
    "variant": "Tarrasch,  Leningrad Variation"
  },
  {
    "eco": "C07",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 c5 4.exd5 Qxd5 5.Ngf3 cxd4 6.Bc4 Qd8 ",
    "ecos": [
      "C07"
    ],
    "variant": "Tarrasch,  Eliskases Variation"
  },
  {
    "eco": "C08",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 c5 4.exd5 exd5 ",
    "ecos": [
      "C08"
    ],
    "variant": "Tarrasch,  open,  4.ed ed"
  },
  {
    "eco": "C09",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nd2 c5 4.exd5 exd5 5.Ngf3 Nc6 ",
    "ecos": [
      "C09"
    ],
    "variant": "Tarrasch,  open Variation,  Main line"
  },
  {
    "eco": "C10",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 5.Nf3 Ngf6 6.Nxf6 Nxf6 7.Ne5 ",
    "ecos": [
      "C10"
    ],
    "variant": "Rubinstein,  Capablanca line"
  },
  {
    "eco": "C11",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Nf6 4.e5 Nfd7 5.f4 c5 6.dxc5 Nc6 7.a3 Bxc5 8.Qg4 O-O 9.Nf3 f6 ",
    "ecos": [
      "C11"
    ],
    "variant": "Steinitz Variation,  Brodsky-Jones Variation"
  },
  {
    "eco": "C12",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Nf6 4.Bg5 Bb4 5.e5 h6 6.exf6 hxg5 7.fxg7 Rg8 8.h4 gxh4 9.Qg4 ",
    "ecos": [
      "C12"
    ],
    "variant": "MacCutcheon Variation,  Grigoriev Variation"
  },
  {
    "eco": "C13",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Nf6 4.Bg5 Be7 5.Bxf6 Bxf6 6.e5 Be7 7.Qg4 ",
    "ecos": [
      "C13"
    ],
    "variant": "Classical Variation,  Anderssen-Richter Variation"
  },
  {
    "eco": "C14",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Nf6 4.Bg5 Be7 5.e5 Nfd7 6.Bxe7 Qxe7 7.f4 O-O 8.Nf3 c5 9.Qd2 Nc6 10.O-O-O c4 ",
    "ecos": [
      "C14"
    ],
    "variant": "Classical Variation,  Stahlberg Variation"
  },
  {
    "eco": "C15",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.Ne2 dxe4 5.a3 Be7 6.Nxe4 Nf6 7.N2g3 O-O 8.Be2 Nc6 ",
    "ecos": [
      "C15"
    ],
    "variant": "Winawer Variation,  Alekhine Gambit,  Alatortsev Variation"
  },
  {
    "eco": "C18",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3 6.bxc3 ",
    "ecos": [
      "C16"
    ],
    "variant": "Winawer Variation,  Advance Variation"
  },
  {
    "eco": "C17",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 cxd4 6.axb4 dxc3 7.Nf3 ",
    "ecos": [
      "C17"
    ],
    "variant": "Winawer Variation,  Advance Variation,  Rauzer Variation"
  },
  {
    "eco": "C18",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3 6.bxc3 Qc7 ",
    "ecos": [
      "C18"
    ],
    "variant": "Winawer Variation,  Classical Variation"
  },
  {
    "eco": "C19",
    "name": "French Defence",
    "pgn": "1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.e5 c5 5.a3 Bxc3 6.bxc3 Ne7 7.Qg4 Qc7 8.Qxg7 Rg8 9.Qxh7 cxd4 10.Kd1 ",
    "ecos": [
      "C19"
    ],
    "variant": "Winawer Variation,  Advance Variation,  poisoned Pawn,  Euwe-Gligoric Variation"
  },
  {
    "eco": "C21",
    "name": "Danish Gambit",
    "pgn": "1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4 cxb2 5.Bxb2 Qe7 ",
    "ecos": [
      "C21"
    ],
    "variant": "Collijn Defence"
  },
  {
    "eco": "C22",
    "name": "Centre Game",
    "pgn": "1.e4 e5 2.d4 exd4 3.Qxd4 Nc6 4.Qe3 Nf6 5.Nc3 Bb4 6.Bd2 O-O 7.O-O-O Re8 8.Bc4 d6 9.Nh3 ",
    "ecos": [
      "C22"
    ],
    "variant": "Kupreichik Variation"
  },
  {
    "eco": "C23",
    "name": "Bishop's Opening",
    "pgn": "1.e4 e5 2.Bc4 Bc5 3.b4 Bxb4 4.f4 exf4 5.Nf3 Be7 6.d4 Bh4 7.g3 fxg3 8.O-O gxh2 9.Kh1 ",
    "ecos": [
      "C23"
    ],
    "variant": "Four Pawns' Gambit"
  },
  {
    "eco": "C24",
    "name": "Bishop's Opening",
    "pgn": "1.e4 e5 2.Bc4 Nf6 3.d4 exd4 4.Nf3 d5 5.exd5 Bb4 6.c3 Qe7 ",
    "ecos": [
      "C24"
    ],
    "variant": "Urusov Gambit,  Panov Variation"
  },
  {
    "eco": "C27",
    "name": "Vienna Game",
    "pgn": "1.e4 e5 2.Nc3 Nf6 3.Bc4 Nxe4 4.Qh5 Nd6 5.Bb3 Be7 ",
    "ecos": [
      "C26",
      "C28"
    ]
  },
  {
    "eco": "C25",
    "name": "Vienna Game",
    "pgn": "1.e4 e5 2.Nc3 Nc6 3.f4 exf4 4.Nf3 g5 5.d4 g4 6.Bc4 gxf3 7.O-O d5 8.exd5 Bg4 9.dxc6 ",
    "ecos": [
      "C25"
    ],
    "variant": "Pierce Gambit,  Rushmere Attack"
  },
  {
    "eco": "C27",
    "name": "Vienna Game",
    "pgn": "1.e4 e5 2.Nc3 Nf6 3.Bc4 Nxe4 4.Qh5 Nd6 5.Bb3 Nc6 6.Nb5 g6 7.Qf3 f5 8.Qd5 Qe7 9.Nxc7 Kd8 10.Nxa8 b6 ",
    "ecos": [
      "C27"
    ],
    "variant": "'Frankenstein-Dracula' Variation"
  },
  {
    "eco": "C29",
    "name": "Vienna Game",
    "pgn": "1.e4 e5 2.Nc3 Nf6 3.f4 d5 4.fxe5 Nxe4 5.d3 Qh4 6.g3 Nxg3 7.Nf3 Qh5 8.Nxd5 ",
    "ecos": [
      "C29"
    ],
    "variant": "Gambit,  Wurzburger trap"
  },
  {
    "eco": "C30",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 Bc5 3.Nf3 d6 4.Nc3 Nf6 5.Bc4 Nc6 6.d3 Bg4 7.h3 Bxf3 8.Qxf3 exf4 ",
    "ecos": [
      "C30"
    ],
    "variant": "Declined,  Classical,  Svenonius Variation"
  },
  {
    "eco": "C31",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 d5 3.exd5 e4 4.d3 Nf6 5.Nc3 Bb4 6.Bd2 e3 ",
    "ecos": [
      "C31"
    ],
    "variant": "Declined,  Falkbeer Counter-Gambit,  Morphy Gambit"
  },
  {
    "eco": "C32",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 d5 3.exd5 e4 4.d3 Nf6 5.dxe4 Nxe4 6.Nf3 Bc5 7.Qe2 Bf2 8.Kd1 Qxd5 9.Nfd2 ",
    "ecos": [
      "C32"
    ],
    "variant": "Declined,  Falkbeer Counter-Gambit,  Alapin Variation"
  },
  {
    "eco": "C33",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Bc4 Qh4 4.Kf1 g5 5.Nc3 Bg7 6.g3 fxg3 7.Qf3 ",
    "ecos": [
      "C33"
    ],
    "variant": "Accepted,  Bishop's Gambit,  Fraser Variation"
  },
  {
    "eco": "C38",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 Bg7 ",
    "ecos": [
      "C34"
    ],
    "variant": "Knight's Gambit"
  },
  {
    "eco": "C35",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Nf3 Be7 4.Bc4 Bh4 5.g3 fxg3 6.O-O gxh2 7.Kh1 ",
    "ecos": [
      "C35"
    ],
    "variant": "Accepted,  Cunningham Defence,  three Pawns Gambit"
  },
  {
    "eco": "C36",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Nf3 d5 4.exd5 Nf6 5.Bb5 c6 6.dxc6 bxc6 7.Bc4 Nd5 ",
    "ecos": [
      "C36"
    ],
    "variant": "Accepted,  Abbazia Defence,  Botvinnik Variation"
  },
  {
    "eco": "C37",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O gxf3 6.Qxf3 Qf6 7.e5 Qxe5 8.d3 Bh6 9.Nc3 Ne7 10.Bd2 Nbc6 11.Rae1 ",
    "ecos": [
      "C37"
    ],
    "variant": "Accepted,  Muzio Gambit,  Paulsen Variation"
  },
  {
    "eco": "C38",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 Bg7 5.h4 h6 6.d4 d6 7.Nc3 c6 8.hxg5 hxg5 9.Rxh8 Bxh8 10.Ne5 ",
    "ecos": [
      "C38"
    ],
    "variant": "Accepted,  Greco Gambit"
  },
  {
    "eco": "C39",
    "name": "King's Gambit",
    "pgn": "1.e4 e5 2.f4 exf4 3.Nf3 g5 4.h4 g4 5.Ng5 h6 6.Nxf7 Kxf7 7.d4 d5 8.Bxf4 dxe4 9.Bc4 Kg7 10.Be5 ",
    "ecos": [
      "C39"
    ],
    "variant": "Accepted,  Allgaier Gambit,  Cook Variation"
  },
  {
    "eco": "C40",
    "name": "Latvian",
    "pgn": "1.e4 e5 2.Nf3 f5 3.Bc4 fxe4 4.Nxe5 Qg5 5.Nf7 Qxg2 6.Rf1 d5 7.Nxh8 Nf6 ",
    "ecos": [
      "C40"
    ],
    "variant": "Behting Variation"
  },
  {
    "eco": "C41",
    "name": "Philidor's Defence",
    "pgn": "1.e4 e5 2.Nf3 d6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Be7 6.Be2 O-O 7.O-O c5 8.Nf3 Nc6 9.Bg5 Be6 10.Re1 ",
    "ecos": [
      "C41"
    ],
    "variant": "Berger Variation"
  },
  {
    "eco": "C42",
    "name": "Petrov's Defence",
    "pgn": "1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4 d5 6.Bd3 Bd6 7.O-O O-O 8.c4 Bg4 9.cxd5 f5 10.Re1 Bxh2 ",
    "ecos": [
      "C42"
    ],
    "variant": "Classical Attack,  Marshall trap"
  },
  {
    "eco": "C43",
    "name": "Petrov's Defence",
    "pgn": "1.e4 e5 2.Nf3 Nf6 3.d4 Nxe4 4.Bd3 d5 5.Nxe5 Bd6 6.O-O O-O 7.c4 Bxe5 ",
    "ecos": [
      "C43"
    ],
    "variant": "Modern Attack,  Trifunovic Variation"
  },
  {
    "eco": "C44",
    "name": "Scotch Opening",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.c3 dxc3 5.Nxc3 d6 6.Bc4 Bg4 7.O-O Ne5 8.Nxe5 Bxd1 9.Bxf7 Ke7 10.Nd5 ",
    "ecos": [
      "C44"
    ],
    "variant": "Sea-cadet mate"
  },
  {
    "eco": "C45",
    "name": "Scotch Opening",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nge7 7.Qd2 d5 8.Nb5 Bxe3 9.Qxe3 O-O 10.Nxc7 Rb8 11.Nxd5 Nxd5 12.exd5 Nb4 ",
    "ecos": [
      "C45"
    ],
    "variant": "Gottschall Variation"
  },
  {
    "eco": "C49",
    "name": "Four Knights Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Bb4 5.O-O O-O 6.d3 Bxc3 ",
    "ecos": [
      "C46"
    ]
  },
  {
    "eco": "C47",
    "name": "Four Knights Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 Bb4 5.Nxe5 ",
    "ecos": [
      "C47"
    ],
    "variant": "Scotch,  Krause Variation"
  },
  {
    "eco": "C48",
    "name": "Four Knights Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 a6 5.Bxc6 dxc6 6.Nxe5 Nxe4 7.Nxe4 Qd4 8.O-O Qxe5 9.Re1 Be6 10.d4 Qd5 ",
    "ecos": [
      "C48"
    ],
    "variant": "Spielmann Variation"
  },
  {
    "eco": "C49",
    "name": "Four Knights Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Bb4 5.O-O O-O 6.d3 d6 7.Bg5 Bxc3 8.bxc3 Qe7 9.Re1 Nd8 10.d4 Bg4 ",
    "ecos": [
      "C49"
    ],
    "variant": "Symmetrical,  Capablanca Variation"
  },
  {
    "eco": "C54",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4 7.Nc3 Nxe4 8.O-O Bxc3 ",
    "ecos": [
      "C50"
    ],
    "variant": "Giuoco Piano"
  },
  {
    "eco": "C51",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Bc5 6.d4 exd4 7.O-O d6 8.cxd4 Bb6 9.Nc3 Bg4 10.Qa4 Bd7 11.Qb3 Na5 12.Bxf7 Kf8 13.Qc2 ",
    "ecos": [
      "C51"
    ],
    "variant": "Evans Gambit,  Fraser-Mortimer Attack"
  },
  {
    "eco": "C52",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O dxc3 8.Qb3 Qf6 9.e5 Qg6 10.Nxc3 Nge7 11.Ba3 ",
    "ecos": [
      "C52"
    ],
    "variant": "Evans Gambit,  compromised Defence,  Paulsen Variation"
  },
  {
    "eco": "C53",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.e5 Ne4 7.Bd5 Nxf2 8.Kxf2 dxc3 9.Kg3 ",
    "ecos": [
      "C53"
    ],
    "variant": "Giuoco Piano,  Ghulam Kassim Variation"
  },
  {
    "eco": "C54",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4 exd4 6.cxd4 Bb4 7.Nc3 Nxe4 8.O-O Bxc3 9.d5 Bf6 10.Re1 Ne7 11.Rxe4 d6 12.Bg5 Bxg5 13.Nxg5 O-O 14.Nxh7 ",
    "ecos": [
      "C54"
    ],
    "variant": "Giuoco Piano,  Therkatz-Herzog Variation"
  },
  {
    "eco": "C55",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d4 exd4 5.O-O Bc5 6.e5 d5 7.exf6 dxc4 8.Re1 Be6 9.Ng5 Qd5 10.Nc3 Qf5 11.g4 Qg6 12.Nce4 Bb6 13.f4 O-O-O ",
    "ecos": [
      "C55"
    ],
    "variant": "Two Knights Defence,  Max Lange Attack,  Berger Variation"
  },
  {
    "eco": "C56",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d4 exd4 5.O-O Nxe4 6.Re1 d5 7.Bxd5 Qxd5 8.Nc3 Qa5 9.Nxe4 Be6 10.Bg5 h6 11.Bh4 g5 12.Nf6 Ke7 13.b4 ",
    "ecos": [
      "C56"
    ],
    "variant": "Two Knights Defence,  Yurdansky Attack"
  },
  {
    "eco": "C57",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7 Kxf7 7.Qf3 Ke6 8.Nc3 Nb4 9.Qe4 c6 10.a3 Na6 11.d4 Nc7 ",
    "ecos": [
      "C57"
    ],
    "variant": "Two Knights Defence,  Fegatello Attack,  Leonhardt Variation"
  },
  {
    "eco": "C58",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Na5 6.d3 h6 7.Nf3 e4 8.Qe2 Nxc4 9.dxc4 Bc5 10.Nfd2 ",
    "ecos": [
      "C58"
    ],
    "variant": "Two Knights Defence,  Yankovich Variation"
  },
  {
    "eco": "C59",
    "name": "Italian Game",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Na5 6.Bb5 c6 7.dxc6 bxc6 8.Be2 h6 9.Nf3 e4 10.Ne5 Bd6 11.d4 Qc7 12.Bd2 ",
    "ecos": [
      "C59"
    ],
    "variant": "Two Knights Defence,  Knorre Variation"
  },
  {
    "eco": "C60",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 Nge7 4.Nc3 g6 ",
    "ecos": [
      "C60"
    ],
    "variant": "Cozio Defence,  Paulsen Variation"
  },
  {
    "eco": "C61",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 Nd4 4.Nxd4 exd4 5.O-O Ne7 ",
    "ecos": [
      "C61"
    ],
    "variant": "Bird's Defence,  Paulsen Variation"
  },
  {
    "eco": "C62",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 d6 4.d4 Bd7 5.Nc3 Nf6 6.Bxc6 ",
    "ecos": [
      "C62"
    ],
    "variant": "old Steinitz Defence,  Nimzovich Attack"
  },
  {
    "eco": "C63",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 f5 4.Nc3 ",
    "ecos": [
      "C63"
    ],
    "variant": "Schliemann Defence,  Berger Variation"
  },
  {
    "eco": "C64",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 Bc5 4.c3 Nf6 5.O-O O-O 6.d4 Bb6 ",
    "ecos": [
      "C64"
    ],
    "variant": "Classical Defence,  Benelux Variation  "
  },
  {
    "eco": "C65",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3 Ne7 5.Nxe5 c6 ",
    "ecos": [
      "C65"
    ],
    "variant": "Berlin Defence,  Mortimer trap"
  },
  {
    "eco": "C66",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O d6 5.d4 Bd7 6.Nc3 Be7 7.Re1 O-O ",
    "ecos": [
      "C66"
    ],
    "variant": "Berlin Defence,  Tarrasch trap"
  },
  {
    "eco": "C67",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.d4 Be7 6.Qe2 Nd6 7.Bxc6 bxc6 8.dxe5 Nb7 9.Nc3 O-O 10.Re1 Nc5 11.Nd4 Ne6 12.Be3 Nxd4 13.Bxd4 c5 ",
    "ecos": [
      "C67"
    ],
    "variant": "Berlin Defence,  Rio de Janeiro Variation"
  },
  {
    "eco": "C68",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Bxc6 dxc6 5.d4 exd4 6.Qxd4 Qxd4 7.Nxd4 Bd7 ",
    "ecos": [
      "C68"
    ],
    "variant": "Exchange,  Alekhine Variation"
  },
  {
    "eco": "C69",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Bxc6 dxc6 5.O-O Bg4 6.h3 h5 ",
    "ecos": [
      "C69"
    ],
    "variant": "Exchange Variation,  Alapin Gambit"
  },
  {
    "eco": "C70",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 b5 5.Bb3 Bc5 ",
    "ecos": [
      "C70"
    ],
    "variant": "Graz Variation"
  },
  {
    "eco": "C88",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.d4 Nxd4 9.Nxd4 exd4 10.Qxd4 c5 ",
    "ecos": [
      "C71"
    ],
    "variant": "Noah's ark trap"
  },
  {
    "eco": "C72",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 d6 5.O-O ",
    "ecos": [
      "C72"
    ],
    "variant": "Modern Steinitz Defence,  5.O-O"
  },
  {
    "eco": "C73",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 d6 5.Bxc6 bxc6 6.d4 f6 ",
    "ecos": [
      "C73"
    ],
    "variant": "Modern Steinitz Defence,  Alapin Variation"
  },
  {
    "eco": "C74",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 d6 5.c3 f5 6.exf5 Bxf5 7.O-O ",
    "ecos": [
      "C74"
    ],
    "variant": "Siesta,  Kopayev Variation"
  },
  {
    "eco": "C75",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 d6 5.c3 Bd7 6.d4 Nge7 ",
    "ecos": [
      "C75"
    ],
    "variant": "Modern Steinitz Defence,  Rubinstein Variation"
  },
  {
    "eco": "C76",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 d6 5.c3 Bd7 6.d4 g6 ",
    "ecos": [
      "C76"
    ],
    "variant": "Modern Steinitz Defence,  Fianchetto (Bronstein) Variation"
  },
  {
    "eco": "C77",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.Qe2 b5 6.Bb3 Be7 7.d4 d6 8.c3 Bg4 ",
    "ecos": [
      "C77"
    ],
    "variant": "Wormald Attack,  Gruenfeld Variation"
  },
  {
    "eco": "C78",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O b5 6.Bb3 d6 7.Ng5 d5 8.exd5 Nd4 9.Re1 Bc5 10.Rxe5 Kf8 ",
    "ecos": [
      "C78"
    ],
    "variant": "Rabinovich Variation"
  },
  {
    "eco": "C79",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O d6 6.Bxc6 bxc6 7.d4 Nxe4 8.Re1 f5 9.dxe5 d5 10.Nc3 ",
    "ecos": [
      "C79"
    ],
    "variant": "Steinitz Defence,  Deferred,  Boleslavsky Variation"
  },
  {
    "eco": "C80",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4 6.d4 b5 7.Bb3 d5 8.dxe5 Be6 9.Nbd2 Nc5 10.c3 d4 11.Ng5 ",
    "ecos": [
      "C80"
    ],
    "variant": "Open,  Bernstein Variation,  Karpov Gambit"
  },
  {
    "eco": "C81",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4 6.d4 b5 7.Bb3 d5 8.dxe5 Be6 9.Qe2 Be7 10.Rd1 O-O 11.c4 bxc4 12.Bxc4 Qd7 ",
    "ecos": [
      "C81"
    ],
    "variant": "Open,  Howell Attack,  Ekstroem Variation"
  },
  {
    "eco": "C82",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4 6.d4 b5 7.Bb3 d5 8.dxe5 Be6 9.c3 Bc5 10.Nbd2 O-O 11.Bc2 Nxf2 ",
    "ecos": [
      "C82"
    ],
    "variant": "Open,  Dilworth Variation"
  },
  {
    "eco": "C83",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Nxe4 6.d4 b5 7.Bb3 d5 8.dxe5 Be6 9.c3 Be7 10.Re1 O-O 11.Nd4 Qd7 12.Nxe6 fxe6 13.Rxe4 ",
    "ecos": [
      "C83"
    ],
    "variant": "Open,  Tarrasch trap"
  },
  {
    "eco": "C84",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.d4 exd4 7.e5 Ne4 8.c3 ",
    "ecos": [
      "C84"
    ],
    "variant": "Closed,  Basque Gambit (North Spanish Variation)"
  },
  {
    "eco": "C85",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Bxc6 ",
    "ecos": [
      "C85"
    ],
    "variant": "Exchange Variation Doubly,  Deferred"
  },
  {
    "eco": "C86",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Qe2 b5 7.Bb3 O-O ",
    "ecos": [
      "C86"
    ],
    "variant": "Worrall Attack,  Sharp line"
  },
  {
    "eco": "C87",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 d6 ",
    "ecos": [
      "C87"
    ],
    "variant": "Closed,  Averbakh Variation"
  },
  {
    "eco": "C88",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 Na5 9.Bc2 c5 10.d4 Qc7 11.h3 Nc6 12.d5 Nb8 13.Nbd2 g5 ",
    "ecos": [
      "C88"
    ],
    "variant": "Closed,  Leonhardt Variation"
  },
  {
    "eco": "C89",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d5 9.exd5 Nxd5 10.Nxe5 Nxe5 11.Rxe5 c6 12.d4 Bd6 13.Re1 Qh4 14.g3 Qh3 15.Be3 Bg4 16.Qd3 Rae8 17.Nd2 Re6 18.a4 Qh5 ",
    "ecos": [
      "C89"
    ],
    "variant": "Marshall Counter-attack,  Main line,  Spassky Variation"
  },
  {
    "eco": "C90",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.Bc2 ",
    "ecos": [
      "C90"
    ],
    "variant": "Closed,  Lutikov Variation"
  },
  {
    "eco": "C91",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.d4 Bg4 ",
    "ecos": [
      "C91"
    ],
    "variant": "Closed,  Bogolyubov Variation"
  },
  {
    "eco": "C92",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Be6 ",
    "ecos": [
      "C92"
    ],
    "variant": "Closed,  Kholmov Variation"
  },
  {
    "eco": "C93",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 h6 ",
    "ecos": [
      "C93"
    ],
    "variant": "Closed,  Smyslov Defence"
  },
  {
    "eco": "C94",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Nb8 ",
    "ecos": [
      "C94"
    ],
    "variant": "Closed,  Breyer Defence"
  },
  {
    "eco": "C95",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Nb8 10.d4 Nbd7 11.Nbd2 Bb7 12.Bc2 c5 ",
    "ecos": [
      "C95"
    ],
    "variant": "Closed,  Breyer Defence,  Gligoric Variation"
  },
  {
    "eco": "C96",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Na5 10.Bc2 c6 11.d4 Qc7 ",
    "ecos": [
      "C96"
    ],
    "variant": "Closed,  Rossolimo Defence"
  },
  {
    "eco": "C97",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Na5 10.Bc2 c5 11.d4 Qc7 12.Nbd2 Bd7 13.Nf1 Rfe8 14.Ne3 g6 ",
    "ecos": [
      "C97"
    ],
    "variant": "Closed,  Chigorin Defence,  Yugoslav System"
  },
  {
    "eco": "C98",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Na5 10.Bc2 c5 11.d4 Qc7 12.Nbd2 Nc6 13.dxc5 ",
    "ecos": [
      "C98"
    ],
    "variant": "Closed,  Chigorin Defence,  Rauzer Attack"
  },
  {
    "eco": "C99",
    "name": "Ruy Lopez",
    "pgn": "1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 O-O 8.c3 d6 9.h3 Na5 10.Bc2 c5 11.d4 Qc7 12.Nbd2 cxd4 13.cxd4 ",
    "ecos": [
      "C99"
    ],
    "variant": "Closed,  Chigorin Defence,  12...c5d4"
  },
  {
    "eco": "D00",
    "name": "Blackmar-Diemer Gambit",
    "pgn": "1.d4 d5 2.Nc3 Nf6 3.e4 dxe4 4.f3 exf3 5.Nxf3 e6 ",
    "ecos": [
      "D00"
    ],
    "variant": "Euwe Defence"
  },
  {
    "eco": "D01",
    "name": "Richter-Veresov Attack",
    "pgn": "1.d4 d5 2.Nc3 Nf6 3.Bg5 Bf5 4.Bxf6 ",
    "ecos": [
      "D01"
    ],
    "variant": "Veresov Variation"
  },
  {
    "eco": "D03",
    "name": "Torre Attack",
    "pgn": "1.d4 d5 2.Nf3 Nf6 3.Bg5 ",
    "ecos": [
      "D03"
    ],
    "variant": "Tartakower Variation"
  },
  {
    "eco": "D05",
    "name": "Queen's Pawn Game",
    "pgn": "1.d4 d5 2.Nf3 Nf6 3.e3 e6 4.Nbd2 c5 5.b3 ",
    "ecos": [
      "D05"
    ],
    "variant": "Zukertort Variation"
  },
  {
    "eco": "D06",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 Bf5 ",
    "ecos": [
      "D06"
    ],
    "variant": "Declined,  Grau Defence"
  },
  {
    "eco": "D07",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 Nc6 3.Nc3 dxc4 4.Nf3 ",
    "ecos": [
      "D07"
    ],
    "variant": "Declined,  Chigorin Defence,  Janowski Variation"
  },
  {
    "eco": "D08",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e5 3.dxe5 d4 4.Nf3 Nc6 5.Nbd2 Bg4 6.h3 Bxf3 7.Nxf3 Bb4 8.Bd2 Qe7 ",
    "ecos": [
      "D08"
    ],
    "variant": "Declined,  Albin Counter-Gambit,  Krenosz Variation"
  },
  {
    "eco": "D09",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e5 3.dxe5 d4 4.Nf3 Nc6 5.g3 ",
    "ecos": [
      "D09"
    ],
    "variant": "Declined,  Albin Counter-Gambit,  5.g3"
  },
  {
    "eco": "D12",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.e3 Bf5 5.cxd5 cxd5 6.Nc3 ",
    "ecos": [
      "D10",
      "D13"
    ],
    "variant": "Declined,  Slav Defence,  Exchange Variation"
  },
  {
    "eco": "D11",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nbd2 ",
    "ecos": [
      "D11"
    ],
    "variant": "Declined,  Slav Defence,  Breyer Variation"
  },
  {
    "eco": "D12",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.e3 Bf5 5.cxd5 cxd5 6.Qb3 Qc8 7.Bd2 e6 8.Na3 ",
    "ecos": [
      "D12"
    ],
    "variant": "Declined,  Slav Defence,  Landau Variation"
  },
  {
    "eco": "D14",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.cxd5 cxd5 5.Nc3 Nc6 6.Bf4 Bf5 7.e3 e6 8.Qb3 Bb4 ",
    "ecos": [
      "D14"
    ],
    "variant": "Declined,  Slav Defence,  Exchange,  Trifunovic Variation"
  },
  {
    "eco": "D15",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.e4 b5 6.e5 ",
    "ecos": [
      "D15"
    ],
    "variant": "Declined,  Slav Defence,  Tolush-Geller Gambit"
  },
  {
    "eco": "D16",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Na6 6.e4 Bg4 ",
    "ecos": [
      "D16"
    ],
    "variant": "Declined,  Slav Defence,  Smyslov Variation"
  },
  {
    "eco": "D17",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.Ne5 Nbd7 7.Nxc4 Qc7 8.g3 e5 ",
    "ecos": [
      "D17"
    ],
    "variant": "Declined,  Slav Defence,  Carlsbad Variation"
  },
  {
    "eco": "D19",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O ",
    "ecos": [
      "D18"
    ],
    "variant": "Declined,  Slav Defence,  Dutch Variation"
  },
  {
    "eco": "D19",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 c6 3.Nf3 Nf6 4.Nc3 dxc4 5.a4 Bf5 6.e3 e6 7.Bxc4 Bb4 8.O-O O-O 9.Qe2 Ne4 10.g4 ",
    "ecos": [
      "D19"
    ],
    "variant": "Declined,  Slav Defence,  Dutch,  Saemisch Variation"
  },
  {
    "eco": "D20",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.e4 c5 4.d5 Nf6 5.Nc3 b5 ",
    "ecos": [
      "D20"
    ],
    "variant": "Accepted,  Linares Variation"
  },
  {
    "eco": "D21",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 a6 4.e4 ",
    "ecos": [
      "D21"
    ],
    "variant": "Accepted,  Alekhine Defence,  Borisenko-Furman Variation"
  },
  {
    "eco": "D22",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 a6 4.e3 Bg4 5.Bxc4 e6 6.d5 ",
    "ecos": [
      "D22"
    ],
    "variant": "Accepted,  Alekhine Defence,  Alatortsev Variation"
  },
  {
    "eco": "D23",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.Qa4 ",
    "ecos": [
      "D23"
    ],
    "variant": "Accepted,  Mannheim Variation"
  },
  {
    "eco": "D24",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.Nc3 a6 5.e4 ",
    "ecos": [
      "D24"
    ],
    "variant": "Accepted,  Bogolyubov Variation"
  },
  {
    "eco": "D25",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 Bg4 ",
    "ecos": [
      "D25"
    ],
    "variant": "Accepted,  Janowsky-Larsen Variation"
  },
  {
    "eco": "D26",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.Qe2 a6 7.dxc5 Bxc5 8.O-O Nc6 9.e4 b5 10.e5 ",
    "ecos": [
      "D26"
    ],
    "variant": "Accepted,  Classical,  Furman Variation"
  },
  {
    "eco": "D27",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6 7.a4 ",
    "ecos": [
      "D27"
    ],
    "variant": "Accepted,  Classical,  Rubinstein Variation"
  },
  {
    "eco": "D28",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6 7.Qe2 b5 8.Bb3 Nc6 9.Rd1 c4 10.Bc2 Nb4 11.Nc3 Nxc2 12.Qxc2 Bb7 13.d5 Qc7 ",
    "ecos": [
      "D28"
    ],
    "variant": "Accepted,  Classical,  Flohr Variation"
  },
  {
    "eco": "D29",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 dxc4 3.Nf3 Nf6 4.e3 e6 5.Bxc4 c5 6.O-O a6 7.Qe2 b5 8.Bb3 Bb7 9.Rd1 Nbd7 10.Nc3 Bd6 ",
    "ecos": [
      "D29"
    ],
    "variant": "Accepted,  Classical,  Smyslov Variation"
  },
  {
    "eco": "D30",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nf3 Nf6 4.Bg5 h6 5.Bxf6 Qxf6 6.Nc3 c6 7.Qb3 ",
    "ecos": [
      "D30"
    ],
    "variant": "Declined,  Hastings Variation"
  },
  {
    "eco": "D31",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 c6 4.Nf3 dxc4 5.a4 Bb4 6.e3 b5 7.Bd2 Qe7 ",
    "ecos": [
      "D31"
    ],
    "variant": "Declined,  Semi-Slav,  Koomen Variation"
  },
  {
    "eco": "D32",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 c5 4.cxd5 exd5 5.dxc5 d4 6.Na4 b5 ",
    "ecos": [
      "D32"
    ],
    "variant": "Declined,  Tarrasch Defence,  Tarrasch Gambit"
  },
  {
    "eco": "D33",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 c5 4.cxd5 exd5 5.Nf3 Nc6 6.g3 Nf6 7.Bg2 Bg4 ",
    "ecos": [
      "D33"
    ],
    "variant": "Declined,  Tarrasch,  Wagner Variation"
  },
  {
    "eco": "D34",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 c5 4.cxd5 exd5 5.Nf3 Nc6 6.g3 Nf6 7.Bg2 Be7 8.O-O O-O 9.Bg5 Be6 10.Rc1 c4 ",
    "ecos": [
      "D34"
    ],
    "variant": "Declined,  Tarrasch,  Bogolyubov Variation"
  },
  {
    "eco": "D35",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 Be7 6.e3 O-O 7.Bd3 Nbd7 8.Qc2 Re8 9.Nge2 Nf8 10.O-O-O ",
    "ecos": [
      "D35"
    ],
    "variant": "Declined,  Exchange,  Chameleon Variation"
  },
  {
    "eco": "D36",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.cxd5 exd5 5.Bg5 c6 6.Qc2 ",
    "ecos": [
      "D36"
    ],
    "variant": "Declined,  Exchange,  positional line,  6.Qc2"
  },
  {
    "eco": "D37",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 Be7 5.Bf4 ",
    "ecos": [
      "D37"
    ],
    "variant": "Declined,  Classical Variation (5.Bf4)"
  },
  {
    "eco": "D38",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 Bb4 ",
    "ecos": [
      "D38"
    ],
    "variant": "Declined,  Ragozin Variation"
  },
  {
    "eco": "D39",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 Bb4 5.Bg5 dxc4 ",
    "ecos": [
      "D39"
    ],
    "variant": "Declined,  Ragozin,  Vienna Variation"
  },
  {
    "eco": "D40",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c5 5.e3 Nc6 6.Bd3 Bd6 7.O-O O-O 8.Qe2 Qe7 9.dxc5 Bxc5 10.e4 ",
    "ecos": [
      "D40"
    ],
    "variant": "Declined,  Semi-Tarrasch,  Levenfish Variation"
  },
  {
    "eco": "D41",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c5 5.cxd5 Nxd5 6.e4 Nxc3 7.bxc3 cxd4 8.cxd4 Bb4 9.Bd2 Bxd2 10.Qxd2 O-O 11.Bb5 ",
    "ecos": [
      "D41"
    ],
    "variant": "Declined,  Semi-Tarrasch,  Kmoch Variation"
  },
  {
    "eco": "D42",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c5 5.cxd5 Nxd5 6.e3 Nc6 7.Bd3 ",
    "ecos": [
      "D42"
    ],
    "variant": "Declined,  Semi-Tarrasch,  7.Bd3"
  },
  {
    "eco": "D43",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.Bg5 h6 6.Bxf6 Qxf6 7.Qb3 ",
    "ecos": [
      "D43"
    ],
    "variant": "Declined,  Semi-Slav,  Hastings Variation"
  },
  {
    "eco": "D44",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.Bg5 dxc4 6.e4 b5 7.e5 h6 8.Bh4 g5 9.Nxg5 hxg5 10.Bxg5 Nbd7 11.Qf3 ",
    "ecos": [
      "D44"
    ],
    "variant": "Declined,  Semi-Slav,  Anti-Meran,  Szabo Variation"
  },
  {
    "eco": "D45",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.e3 Ne4 6.Bd3 f5 ",
    "ecos": [
      "D45"
    ],
    "variant": "Declined,  Semi-Slav,  Stonewall Defence"
  },
  {
    "eco": "D46",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.e3 Nbd7 6.Bd3 Be7 ",
    "ecos": [
      "D46"
    ],
    "variant": "Bogolyubov Variation"
  },
  {
    "eco": "D47",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.e3 Nbd7 6.Bd3 dxc4 7.Bxc4 b5 8.Bd3 Bb7 ",
    "ecos": [
      "D47"
    ],
    "variant": "Declined,  Semi-Slav,  Meran,  Wade Variation"
  },
  {
    "eco": "D48",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.e3 Nbd7 6.Bd3 dxc4 7.Bxc4 b5 8.Bd3 a6 9.e4 c5 10.d5 ",
    "ecos": [
      "D48"
    ],
    "variant": "Declined,  Semi-Slav,  Meran,  Reynolds' Variation"
  },
  {
    "eco": "D49",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Nf3 c6 5.e3 Nbd7 6.Bd3 dxc4 7.Bxc4 b5 8.Bd3 a6 9.e4 c5 10.e5 cxd4 11.Nxb5 Nxe5 12.Nxe5 axb5 13.O-O Qd5 14.Qe2 Ba6 15.Bg5 ",
    "ecos": [
      "D49"
    ],
    "variant": "Declined,  Semi-Slav,  Meran,  Rellstab Attack"
  },
  {
    "eco": "D50",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 c5 5.Nf3 cxd4 6.Nxd4 e5 7.Ndb5 a6 8.Qa4 ",
    "ecos": [
      "D50"
    ],
    "variant": "Declined,  Semi-Tarrasch,  Krause Variation"
  },
  {
    "eco": "D51",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.Nf3 c6 6.Rc1 Qa5 7.Bd2 ",
    "ecos": [
      "D51"
    ],
    "variant": "Declined,  Rochlin Variation"
  },
  {
    "eco": "D52",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Nbd7 5.e3 c6 6.Nf3 Qa5 7.Nd2 Bb4 8.Qc2 O-O 9.Bh4 ",
    "ecos": [
      "D52"
    ],
    "variant": "Declined,  Cambridge Springs Defence,  Argentine Variation"
  },
  {
    "eco": "D53",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 Ne4 ",
    "ecos": [
      "D53"
    ],
    "variant": "Declined,  Lasker Variation"
  },
  {
    "eco": "D54",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Rc1 ",
    "ecos": [
      "D54"
    ],
    "variant": "Declined,  Anti-neo-orthodox Variation"
  },
  {
    "eco": "D55",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bxf6 Bxf6 8.Rc1 c6 9.Bd3 Nd7 10.O-O dxc4 11.Bxc4 ",
    "ecos": [
      "D55"
    ],
    "variant": "Declined,  Petrosian Variation"
  },
  {
    "eco": "D56",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 Ne4 8.Bxe7 Qxe7 9.Qc2 Nf6 10.Bd3 dxc4 11.Bxc4 c5 12.O-O Nc6 13.Rfd1 Bd7 ",
    "ecos": [
      "D56"
    ],
    "variant": "Declined,  Lasker Defence,  Russian Variation"
  },
  {
    "eco": "D57",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 Ne4 8.Bxe7 Qxe7 9.cxd5 Nxc3 10.bxc3 exd5 11.Qb3 Qd6 ",
    "ecos": [
      "D57"
    ],
    "variant": "Declined,  Lasker Defence,  Bernstein Variation"
  },
  {
    "eco": "D58",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6 ",
    "ecos": [
      "D58"
    ],
    "variant": "Declined,  Tartakower (Makagonov-Bondarevsky) System"
  },
  {
    "eco": "D59",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 h6 7.Bh4 b6 8.cxd5 Nxd5 9.Bxe7 Qxe7 10.Nxd5 exd5 11.Rc1 Be6 ",
    "ecos": [
      "D59"
    ],
    "variant": "Declined,  Tartakower Variation"
  },
  {
    "eco": "D63",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 ",
    "ecos": [
      "D60"
    ],
    "variant": "Declined,  Orthodox Defence"
  },
  {
    "eco": "D61",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Qc2 ",
    "ecos": [
      "D61"
    ],
    "variant": "Declined,  Orthodox Defence,  Rubinstein Variation"
  },
  {
    "eco": "D62",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Qc2 c5 8.cxd5 ",
    "ecos": [
      "D62"
    ],
    "variant": "Declined,  Orthodox Defence,  7.Qc2 c5,  8.cd (Rubinstein)"
  },
  {
    "eco": "D63",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 b6 8.cxd5 exd5 9.Bd3 ",
    "ecos": [
      "D63"
    ],
    "variant": "Declined,  Orthodox Defence,  Pillsbury Attack"
  },
  {
    "eco": "D64",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Qc2 a6 9.a3 ",
    "ecos": [
      "D64"
    ],
    "variant": "Declined,  Orthodox Defence,  Rubinstein Attack,  Gruenfeld Variation"
  },
  {
    "eco": "D65",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Qc2 a6 9.cxd5 ",
    "ecos": [
      "D65"
    ],
    "variant": "Declined,  Orthodox Defence,  Rubinstein Attack,  Main line"
  },
  {
    "eco": "D67",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 ",
    "ecos": [
      "D66"
    ],
    "variant": "Declined,  Orthodox Defence,  Bd3 line"
  },
  {
    "eco": "D67",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.Ne4 ",
    "ecos": [
      "D67"
    ],
    "variant": "Declined,  Orthodox Defence,  Bd3 line,  Alekhine Variation"
  },
  {
    "eco": "D68",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O Nxc3 12.Rxc3 e5 13.Qb1 ",
    "ecos": [
      "D68"
    ],
    "variant": "Declined,  Orthodox Defence,  Classical,  13.d1b1 (Maroczy)"
  },
  {
    "eco": "D69",
    "name": "Queen's Gambit",
    "pgn": "1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3 O-O 6.Nf3 Nbd7 7.Rc1 c6 8.Bd3 dxc4 9.Bxc4 Nd5 10.Bxe7 Qxe7 11.O-O Nxc3 12.Rxc3 e5 13.dxe5 Nxe5 14.Nxe5 Qxe5 ",
    "ecos": [
      "D69"
    ],
    "variant": "Declined,  Orthodox Defence,  Classical,  13.de"
  },
  {
    "eco": "D70",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.f3 d5 ",
    "ecos": [
      "D70"
    ],
    "variant": "Neo-Gruenfeld Defence"
  },
  {
    "eco": "D71",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.cxd5 Nxd5 ",
    "ecos": [
      "D71"
    ],
    "variant": "Neo-Gruenfeld Defence,  5.cd"
  },
  {
    "eco": "D72",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.cxd5 Nxd5 6.e4 Nb6 7.Ne2 ",
    "ecos": [
      "D72"
    ],
    "variant": "Neo-Gruenfeld Defence,  5.cd,  Main line"
  },
  {
    "eco": "D73",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 ",
    "ecos": [
      "D73"
    ],
    "variant": "Neo-Gruenfeld Defence,  5.Nf3"
  },
  {
    "eco": "D74",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 O-O 6.cxd5 Nxd5 7.O-O ",
    "ecos": [
      "D74"
    ],
    "variant": "Neo-Gruenfeld Defence,  6.cd Nxd5,  7.O-O"
  },
  {
    "eco": "D75",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 O-O 6.cxd5 Nxd5 7.O-O c5 8.dxc5 ",
    "ecos": [
      "D75"
    ],
    "variant": "Neo-Gruenfeld Defence,  6.cd Nxd5,  7.O-O c5,  8.dc"
  },
  {
    "eco": "D76",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 O-O 6.cxd5 Nxd5 7.O-O Nb6 ",
    "ecos": [
      "D76"
    ],
    "variant": "Neo-Gruenfeld Defence,  6.cd Nxd5,  7.O-O Nb6"
  },
  {
    "eco": "D77",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 O-O 6.O-O ",
    "ecos": [
      "D77"
    ],
    "variant": "Neo-Gruenfeld Defence,  6.O-O"
  },
  {
    "eco": "D78",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 O-O 6.O-O c6 ",
    "ecos": [
      "D78"
    ],
    "variant": "Neo-Gruenfeld Defence,  6.O-O c6"
  },
  {
    "eco": "D79",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 d5 4.Bg2 Bg7 5.Nf3 O-O 6.O-O c6 7.cxd5 cxd5 ",
    "ecos": [
      "D79"
    ],
    "variant": "Neo-Gruenfeld Defence,  6.O-O,  Main line"
  },
  {
    "eco": "D80",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Bg5 Ne4 5.Nxe4 dxe4 6.Qd2 c5 ",
    "ecos": [
      "D80"
    ],
    "variant": "Lundin Variation"
  },
  {
    "eco": "D96",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Qb3 ",
    "ecos": [
      "D81",
      "D96"
    ],
    "variant": "Russian Variation"
  },
  {
    "eco": "D82",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Bf4 ",
    "ecos": [
      "D82"
    ],
    "variant": "4.Bf4"
  },
  {
    "eco": "D83",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Bf4 Bg7 5.e3 O-O 6.Rc1 c5 7.dxc5 Be6 ",
    "ecos": [
      "D83"
    ],
    "variant": "Gruenfeld Gambit,  Botvinnik Variation"
  },
  {
    "eco": "D84",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Bf4 Bg7 5.e3 O-O 6.cxd5 Nxd5 7.Nxd5 Qxd5 8.Bxc7 ",
    "ecos": [
      "D84"
    ],
    "variant": "Gruenfeld Gambit,  Accepted"
  },
  {
    "eco": "D85",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Nf3 ",
    "ecos": [
      "D85"
    ],
    "variant": "Modern Exchange Variation"
  },
  {
    "eco": "D86",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Bc4 O-O 8.Ne2 Qd7 9.O-O b6 ",
    "ecos": [
      "D86"
    ],
    "variant": "Exchange Variation,  Larsen Variation"
  },
  {
    "eco": "D87",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Bc4 O-O 8.Ne2 c5 9.O-O Nc6 10.Be3 Bg4 11.f3 Na5 12.Bxf7 ",
    "ecos": [
      "D87"
    ],
    "variant": "Exchange Variation,  Seville Variation"
  },
  {
    "eco": "D88",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Bc4 O-O 8.Ne2 c5 9.O-O Nc6 10.Be3 cxd4 11.cxd4 ",
    "ecos": [
      "D88"
    ],
    "variant": "Spassky Variation,  Main line,  10...cd,  11.cd"
  },
  {
    "eco": "D89",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.cxd5 Nxd5 5.e4 Nxc3 6.bxc3 Bg7 7.Bc4 O-O 8.Ne2 c5 9.O-O Nc6 10.Be3 cxd4 11.cxd4 Bg4 12.f3 Na5 13.Bd3 Be6 14.d5 ",
    "ecos": [
      "D89"
    ],
    "variant": "Exchange Variation,  Sokolsky Variation"
  },
  {
    "eco": "D90",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Qa4 ",
    "ecos": [
      "D90"
    ],
    "variant": "Flohr Variation"
  },
  {
    "eco": "D91",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Bg5 ",
    "ecos": [
      "D91"
    ],
    "variant": "5.Bg5"
  },
  {
    "eco": "D92",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Bf4 ",
    "ecos": [
      "D92"
    ],
    "variant": "5.Bf4"
  },
  {
    "eco": "D93",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Bf4 O-O 6.e3 ",
    "ecos": [
      "D93"
    ],
    "variant": "With Bf4    e3"
  },
  {
    "eco": "D94",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.e3 O-O 6.Bd3 c6 7.O-O Bg4 ",
    "ecos": [
      "D94"
    ],
    "variant": "Smyslov Defence"
  },
  {
    "eco": "D95",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.e3 O-O 6.Qb3 dxc4 7.Bxc4 Nbd7 8.Ng5 ",
    "ecos": [
      "D95"
    ],
    "variant": "Pachman Variation"
  },
  {
    "eco": "D97",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Qb3 dxc4 6.Qxc4 O-O 7.e4 Nc6 ",
    "ecos": [
      "D97"
    ],
    "variant": "Russian Variation,  Byrne Variation"
  },
  {
    "eco": "D98",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Qb3 dxc4 6.Qxc4 O-O 7.e4 Bg4 8.Be3 Nfd7 9.Be2 Nb6 10.Qd3 Nc6 11.O-O-O ",
    "ecos": [
      "D98"
    ],
    "variant": "Russian Variation,  Keres Variation"
  },
  {
    "eco": "D99",
    "name": "Gruenfeld Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 d5 4.Nf3 Bg7 5.Qb3 dxc4 6.Qxc4 O-O 7.e4 Bg4 8.Be3 Nfd7 9.Qb3 c5 ",
    "ecos": [
      "D99"
    ],
    "variant": "Smyslov,  Yugoslav Variation"
  },
  {
    "eco": "E01",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 ",
    "ecos": [
      "E01"
    ],
    "variant": "Closed"
  },
  {
    "eco": "E02",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4 5.Qa4 ",
    "ecos": [
      "E02"
    ],
    "variant": "Open,  5.Qa4"
  },
  {
    "eco": "E03",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4 5.Qa4 Nbd7 6.Qxc4 a6 7.Qc2 ",
    "ecos": [
      "E03"
    ],
    "variant": "Open,  Alekhine Variation"
  },
  {
    "eco": "E04",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4 5.Nf3 ",
    "ecos": [
      "E04"
    ],
    "variant": "Open,  5.Nf3"
  },
  {
    "eco": "E05",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 dxc4 5.Nf3 Be7 ",
    "ecos": [
      "E05"
    ],
    "variant": "Open,  Classical line"
  },
  {
    "eco": "E06",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 ",
    "ecos": [
      "E06"
    ],
    "variant": "Closed,  5.Nf3"
  },
  {
    "eco": "E07",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 O-O 6.O-O Nbd7 7.Nc3 c6 8.Qd3 ",
    "ecos": [
      "E07"
    ],
    "variant": "Closed,  Botvinnik Variation"
  },
  {
    "eco": "E08",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 O-O 6.O-O Nbd7 7.Qc2 c6 8.b3 b6 9.Rd1 Bb7 10.Nc3 b5 ",
    "ecos": [
      "E08"
    ],
    "variant": "Closed,  Spassky Gambit"
  },
  {
    "eco": "E09",
    "name": "Catalan Opening",
    "pgn": "1.d4 Nf6 2.c4 e6 3.g3 d5 4.Bg2 Be7 5.Nf3 O-O 6.O-O Nbd7 7.Qc2 c6 8.Nbd2 b6 9.b3 a5 10.Bb2 Ba6 ",
    "ecos": [
      "E09"
    ],
    "variant": "Closed,  Sokolsky Variation"
  },
  {
    "eco": "E10",
    "name": "Blumenfeld Counter-Gambit",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 c5 4.d5 b5 5.dxe6 fxe6 6.cxb5 d5 ",
    "ecos": [
      "E10"
    ],
    "variant": "Accepted"
  },
  {
    "eco": "E11",
    "name": "Bogo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 Bb4 4.Bd2 Bxd2 5.Qxd2 b6 6.g3 Bb7 7.Bg2 O-O 8.Nc3 Ne4 9.Qc2 Nxc3 10.Ng5 ",
    "ecos": [
      "E11"
    ],
    "variant": "Monticelli trap"
  },
  {
    "eco": "E12",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.Nc3 Bb7 5.Bg5 h6 6.Bh4 g5 7.Bg3 Nh5 ",
    "ecos": [
      "E12"
    ],
    "variant": "4.Nc3,  Botvinnik Variation"
  },
  {
    "eco": "E13",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.Nc3 Bb7 5.Bg5 h6 6.Bh4 Bb4 ",
    "ecos": [
      "E13"
    ],
    "variant": "4.Nc3,  Main line"
  },
  {
    "eco": "E14",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.e3 Bb7 5.Bd3 c5 6.O-O Be7 7.b3 O-O 8.Bb2 cxd4 9.Nxd4 ",
    "ecos": [
      "E14"
    ],
    "variant": "Averbakh Variation"
  },
  {
    "eco": "E15",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.g3 Bb7 5.Bg2 c5 6.d5 exd5 7.Nh4 ",
    "ecos": [
      "E15"
    ],
    "variant": "Rubinstein Variation"
  },
  {
    "eco": "E16",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.g3 Bb7 5.Bg2 Bb4 6.Bd2 Be7 ",
    "ecos": [
      "E16"
    ],
    "variant": "Riumin Variation"
  },
  {
    "eco": "E17",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.g3 Bb7 5.Bg2 Be7 6.Nc3 Ne4 7.Bd2 ",
    "ecos": [
      "E17"
    ],
    "variant": "Opovcensky Variation"
  },
  {
    "eco": "E18",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.g3 Bb7 5.Bg2 Be7 6.O-O O-O 7.Nc3 ",
    "ecos": [
      "E18"
    ],
    "variant": "old Main line,  7.Nc3"
  },
  {
    "eco": "E19",
    "name": "Queen's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nf3 b6 4.g3 Bb7 5.Bg2 Be7 6.O-O O-O 7.Nc3 Ne4 8.Qc2 Nxc3 9.Qxc3 ",
    "ecos": [
      "E19"
    ],
    "variant": "old Main line,  9.Qxc3"
  },
  {
    "eco": "E20",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qd3 ",
    "ecos": [
      "E20"
    ],
    "variant": "Mikenas Attack"
  },
  {
    "eco": "E21",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Nf3 c5 5.d5 Ne4 ",
    "ecos": [
      "E21"
    ],
    "variant": "three Knights,  Euwe Variation"
  },
  {
    "eco": "E22",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qb3 ",
    "ecos": [
      "E22"
    ],
    "variant": "Spielmann Variation"
  },
  {
    "eco": "E23",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qb3 c5 5.dxc5 Nc6 6.Nf3 Ne4 7.Bd2 Nxc5 8.Qc2 f5 9.g3 ",
    "ecos": [
      "E23"
    ],
    "variant": "Spielmann,  Staahlberg Variation"
  },
  {
    "eco": "E25",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3 5.bxc3 c5 6.f3 d5 7.cxd5 ",
    "ecos": [
      "E26",
      "E27",
      "E28"
    ],
    "variant": "Saemisch Variation"
  },
  {
    "eco": "E24",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3 5.bxc3 c5 6.f3 d5 7.e3 O-O 8.cxd5 Nxd5 ",
    "ecos": [
      "E24"
    ],
    "variant": "Saemisch,  Botvinnik Variation"
  },
  {
    "eco": "E25",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3 5.bxc3 c5 6.f3 d5 7.cxd5 Nxd5 8.dxc5 f5 ",
    "ecos": [
      "E25"
    ],
    "variant": "Saemisch,  Romanovsky Variation"
  },
  {
    "eco": "E29",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.a3 Bxc3 5.bxc3 O-O 6.e3 c5 7.Bd3 Nc6 8.Ne2 b6 9.e4 Ne8 ",
    "ecos": [
      "E29"
    ],
    "variant": "Saemisch,  Capablanca Variation"
  },
  {
    "eco": "E30",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Bg5 h6 5.Bh4 c5 6.d5 b5 ",
    "ecos": [
      "E30"
    ],
    "variant": "Leningrad,  ...b5 Gambit"
  },
  {
    "eco": "E31",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Bg5 h6 5.Bh4 c5 6.d5 d6 ",
    "ecos": [
      "E31"
    ],
    "variant": "Leningrad,  Main line"
  },
  {
    "eco": "E32",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 O-O 5.a3 Bxc3 6.Qxc3 b5 ",
    "ecos": [
      "E32"
    ],
    "variant": "Classical,  Adorjan Gambit"
  },
  {
    "eco": "E33",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 Nc6 5.Nf3 d6 ",
    "ecos": [
      "E33"
    ],
    "variant": "Classical,  Milner-Barry (Zurich) Variation"
  },
  {
    "eco": "E34",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 d5 ",
    "ecos": [
      "E34"
    ],
    "variant": "Classical,  Noa Variation"
  },
  {
    "eco": "E35",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 d5 5.cxd5 exd5 ",
    "ecos": [
      "E35"
    ],
    "variant": "Classical,  Noa Variation,  5.cd ed"
  },
  {
    "eco": "E36",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 d5 5.a3 Bxc3 6.Qxc3 Nc6 ",
    "ecos": [
      "E36"
    ],
    "variant": "Classical,  Botvinnik Variation"
  },
  {
    "eco": "E37",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 d5 5.a3 Bxc3 6.Qxc3 Ne4 7.Qc2 Nc6 8.e3 e5 ",
    "ecos": [
      "E37"
    ],
    "variant": "Classical,  San Remo Variation"
  },
  {
    "eco": "E38",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 c5 ",
    "ecos": [
      "E38"
    ],
    "variant": "Classical,  4...c5"
  },
  {
    "eco": "E39",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 c5 5.dxc5 O-O ",
    "ecos": [
      "E39"
    ],
    "variant": "Classical,  Pirc Variation"
  },
  {
    "eco": "E40",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 Nc6 ",
    "ecos": [
      "E40"
    ],
    "variant": "4.e3,  Taimanov Variation"
  },
  {
    "eco": "E41",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 c5 5.Bd3 Nc6 6.Nf3 Bxc3 7.bxc3 d6 ",
    "ecos": [
      "E41"
    ],
    "variant": "e3,  Huebner Variation"
  },
  {
    "eco": "E42",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 c5 5.Ne2 ",
    "ecos": [
      "E42"
    ],
    "variant": "4.e3 c5,  5.Ne2 (Rubinstein)"
  },
  {
    "eco": "E43",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 b6 ",
    "ecos": [
      "E43"
    ],
    "variant": "Fischer Variation"
  },
  {
    "eco": "E44",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 b6 5.Ne2 ",
    "ecos": [
      "E44"
    ],
    "variant": "Fischer Variation,  5.Ne2"
  },
  {
    "eco": "E45",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 b6 5.Ne2 Ba6 ",
    "ecos": [
      "E45"
    ],
    "variant": "4.e3,  Bronstein Variation"
  },
  {
    "eco": "E46",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Ne2 d5 6.a3 Bd6 ",
    "ecos": [
      "E46"
    ],
    "variant": "Simagin Variation"
  },
  {
    "eco": "E47",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Bd3 ",
    "ecos": [
      "E47"
    ],
    "variant": "4.e3 O-O,  5.Bd3"
  },
  {
    "eco": "E48",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Bd3 d5 ",
    "ecos": [
      "E48"
    ],
    "variant": "4.e3 O-O,  5.Bd3 d5"
  },
  {
    "eco": "E49",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Bd3 d5 6.a3 Bxc3 7.bxc3 ",
    "ecos": [
      "E49"
    ],
    "variant": "4.e3,  Botvinnik System"
  },
  {
    "eco": "E50",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 ",
    "ecos": [
      "E50"
    ],
    "variant": "4.e3 e8g8,  5.Nf3,  Without ...d5"
  },
  {
    "eco": "E51",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 Nc6 7.O-O dxc4 ",
    "ecos": [
      "E51"
    ],
    "variant": "4.e3,  Ragozin Variation"
  },
  {
    "eco": "E52",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 b6 ",
    "ecos": [
      "E52"
    ],
    "variant": "4.e3,  Main line With ...b6"
  },
  {
    "eco": "E53",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O Nbd7 ",
    "ecos": [
      "E53"
    ],
    "variant": "4.e3,  Gligoric System With 7...Nbd7"
  },
  {
    "eco": "E54",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O dxc4 8.Bxc4 Qe7 ",
    "ecos": [
      "E54"
    ],
    "variant": "4.e3,  Gligoric System,  Smyslov Variation"
  },
  {
    "eco": "E55",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O dxc4 8.Bxc4 Nbd7 ",
    "ecos": [
      "E55"
    ],
    "variant": "4.e3,  Gligoric System,  Bronstein Variation"
  },
  {
    "eco": "E56",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O Nc6 ",
    "ecos": [
      "E56"
    ],
    "variant": "4.e3,  Main line With 7...Nc6"
  },
  {
    "eco": "E57",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O Nc6 8.a3 dxc4 9.Bxc4 cxd4 ",
    "ecos": [
      "E57"
    ],
    "variant": "4.e3,  Main line With 8...dc and 9...cd"
  },
  {
    "eco": "E58",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O Nc6 8.a3 Bxc3 9.bxc3 ",
    "ecos": [
      "E58"
    ],
    "variant": "4.e3,  Main line With 8...Bxc3"
  },
  {
    "eco": "E59",
    "name": "Nimzo-Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.e3 O-O 5.Nf3 d5 6.Bd3 c5 7.O-O Nc6 8.a3 Bxc3 9.bxc3 dxc4 10.Bxc4 ",
    "ecos": [
      "E59"
    ],
    "variant": "4.e3,  Main line"
  },
  {
    "eco": "E60",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.g3 Bg7 4.Bg2 d5 ",
    "ecos": [
      "E60"
    ],
    "variant": "3.g3,  Counterthrust Variation"
  },
  {
    "eco": "E61",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.Bg5 ",
    "ecos": [
      "E61"
    ],
    "variant": "Smyslov System"
  },
  {
    "eco": "E62",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 Nc6 7.O-O Bf5 ",
    "ecos": [
      "E62"
    ],
    "variant": "Fianchetto,  lesser Simagin (Spassky) Variation"
  },
  {
    "eco": "E63",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 Nc6 7.O-O a6 ",
    "ecos": [
      "E63"
    ],
    "variant": "Fianchetto,  Panno Variation"
  },
  {
    "eco": "E64",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 c5 ",
    "ecos": [
      "E64"
    ],
    "variant": "Fianchetto,  Yugoslav System"
  },
  {
    "eco": "E65",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 c5 7.O-O ",
    "ecos": [
      "E65"
    ],
    "variant": "Fianchetto,  Yugoslav System,  7.O-O"
  },
  {
    "eco": "E66",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 c5 7.O-O Nc6 8.d5 ",
    "ecos": [
      "E66"
    ],
    "variant": "Fianchetto,  Yugoslav Panno"
  },
  {
    "eco": "E67",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 Nbd7 7.O-O e5 ",
    "ecos": [
      "E67"
    ],
    "variant": "Fianchetto,  Classical Variation"
  },
  {
    "eco": "E68",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 Nbd7 7.O-O e5 8.e4 ",
    "ecos": [
      "E68"
    ],
    "variant": "Fianchetto,  Classical Variation,  8.e4"
  },
  {
    "eco": "E69",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.Nf3 d6 5.g3 O-O 6.Bg2 Nbd7 7.O-O e5 8.e4 c6 9.h3 ",
    "ecos": [
      "E69"
    ],
    "variant": "Fianchetto,  Classical Main line"
  },
  {
    "eco": "E70",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nge2 ",
    "ecos": [
      "E70"
    ],
    "variant": "Kramer System"
  },
  {
    "eco": "E71",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.h3 ",
    "ecos": [
      "E71"
    ],
    "variant": "Makagonov System (5.h3)"
  },
  {
    "eco": "E72",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.g3 O-O 6.Bg2 e5 7.Nge2 ",
    "ecos": [
      "E72"
    ],
    "variant": "Pomar System"
  },
  {
    "eco": "E73",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Be2 O-O 6.Be3 ",
    "ecos": [
      "E73"
    ],
    "variant": "Semi-Averbakh System"
  },
  {
    "eco": "E74",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Be2 O-O 6.Bg5 c5 ",
    "ecos": [
      "E74"
    ],
    "variant": "Averbakh System,  6...c5"
  },
  {
    "eco": "E75",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Be2 O-O 6.Bg5 c5 7.d5 e6 ",
    "ecos": [
      "E75"
    ],
    "variant": "Averbakh System,  Main line"
  },
  {
    "eco": "E77",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Be2 c5 7.d5 e6 8.Nf3 ",
    "ecos": [
      "E76"
    ],
    "variant": "Four Pawns Attack"
  },
  {
    "eco": "E77",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Be2 c5 7.d5 e6 8.dxe6 fxe6 9.g4 Nc6 10.h4 ",
    "ecos": [
      "E77"
    ],
    "variant": "Six Pawns Attack"
  },
  {
    "eco": "E78",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Be2 c5 7.Nf3 ",
    "ecos": [
      "E78"
    ],
    "variant": "Four Pawns Attack,  With Be2 and Nf3"
  },
  {
    "eco": "E79",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 O-O 6.Be2 c5 7.Nf3 cxd4 8.Nxd4 Nc6 9.Be3 ",
    "ecos": [
      "E79"
    ],
    "variant": "Four Pawns Attack,  Main line"
  },
  {
    "eco": "E80",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 ",
    "ecos": [
      "E80"
    ],
    "variant": "Saemisch Variation"
  },
  {
    "eco": "E81",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 c6 7.Bd3 a6 ",
    "ecos": [
      "E81"
    ],
    "variant": "Saemisch,  Byrne Variation"
  },
  {
    "eco": "E82",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 b6 ",
    "ecos": [
      "E82"
    ],
    "variant": "Saemisch,  double Fianchetto Variation"
  },
  {
    "eco": "E83",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 Nc6 7.Nge2 Rb8 ",
    "ecos": [
      "E83"
    ],
    "variant": "Saemisch,  Ruban Variation"
  },
  {
    "eco": "E84",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 Nc6 7.Nge2 a6 8.Qd2 Rb8 ",
    "ecos": [
      "E84"
    ],
    "variant": "Saemisch,  Panno Main line"
  },
  {
    "eco": "E85",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 e5 ",
    "ecos": [
      "E85"
    ],
    "variant": "Saemisch,  Orthodox Variation"
  },
  {
    "eco": "E86",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 e5 7.Nge2 c6 ",
    "ecos": [
      "E86"
    ],
    "variant": "Saemisch,  Orthodox,  7.Nge2 c6"
  },
  {
    "eco": "E87",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 e5 7.d5 Nh5 8.Qd2 Qh4 9.g3 Nxg3 10.Qf2 Nxf1 11.Qxh4 Nxe3 12.Ke2 Nxc4 ",
    "ecos": [
      "E87"
    ],
    "variant": "Saemisch,  Orthodox,  Bronstein Variation"
  },
  {
    "eco": "E88",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 e5 7.d5 c6 ",
    "ecos": [
      "E88"
    ],
    "variant": "Saemisch,  Orthodox,  7.d5 c6"
  },
  {
    "eco": "E89",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f3 O-O 6.Be3 e5 7.d5 c6 8.Nge2 cxd5 ",
    "ecos": [
      "E89"
    ],
    "variant": "Saemisch,  Orthodox Main line"
  },
  {
    "eco": "E90",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be3 ",
    "ecos": [
      "E90"
    ],
    "variant": "Larsen Variation"
  },
  {
    "eco": "E91",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 Na6 ",
    "ecos": [
      "E91"
    ],
    "variant": "Kazakh Variation"
  },
  {
    "eco": "E92",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 a5 ",
    "ecos": [
      "E92"
    ],
    "variant": "Petrosian System,  Stein Variation"
  },
  {
    "eco": "E93",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.d5 Nbd7 8.Bg5 h6 9.Bh4 g5 10.Bg3 Nh5 11.h4 ",
    "ecos": [
      "E93"
    ],
    "variant": "Petrosian System,  Keres Variation"
  },
  {
    "eco": "E94",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nbd7 ",
    "ecos": [
      "E94"
    ],
    "variant": "orthodox,  7...Nbd7"
  },
  {
    "eco": "E95",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nbd7 8.Re1 ",
    "ecos": [
      "E95"
    ],
    "variant": "orthodox,  7...Nbd7,  8.Re1"
  },
  {
    "eco": "E96",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nbd7 8.Re1 c6 9.Bf1 a5 ",
    "ecos": [
      "E96"
    ],
    "variant": "orthodox,  7...Nbd7,  Main line"
  },
  {
    "eco": "E97",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.b4 ",
    "ecos": [
      "E97"
    ],
    "variant": "orthodox,  Aronin-Taimanov,  bayonet Attack"
  },
  {
    "eco": "E98",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 ",
    "ecos": [
      "E98"
    ],
    "variant": "orthodox,  Aronin-Taimanov,  9.Ne1"
  },
  {
    "eco": "E99",
    "name": "King's Indian Defence",
    "pgn": "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 e5 7.O-O Nc6 8.d5 Ne7 9.Ne1 Nd7 10.f3 f5 11.g4 ",
    "ecos": [
      "E99"
    ],
    "variant": "orthodox,  Aronin-Taimanov,  Benko Attack"
  },
  {
    "eco": "Z01",
    "name": "Bongcloud Attack",
    "pgn": "1. e4 e5 2. Ke2",
    "ecos": [
      "Z01"
    ]
  },
  {
    "eco": "Z02",
    "name": "Botez Gambit",
    "pgn": "1. Qxd8+",
    "ecos": [
      "Z02"
    ]
  },
  {
    "eco": "Z03",
    "name": "Grob Attack",
    "pgn": "1. g4",
    "ecos": [
      "Z03"
    ]
  },
  {
    "eco": "Z04",
    "name": "Ware Opening",
    "pgn": "1. a4",
    "ecos": [
      "Z04"
    ]
  },
  {
    "eco": "Z05",
    "name": "Crab Opening",
    "pgn": "1. a4 h5",
    "ecos": [
      "Z05"
    ]
  },
  {
    "eco": "Z06",
    "name": "Jerome Gambit",
    "pgn": "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Bxf7+",
    "ecos": [
      "Z06"
    ]
  },
  {
    "eco": "Z07",
    "name": "Englund Gambit Trap",
    "pgn": "1. d4 e5 2. dxe5 Nc6",
    "ecos": [
      "Z07"
    ]
  },
  {
    "eco": "Z08",
    "name": "St. George Defence",
    "pgn": "1. e4 a6",
    "ecos": [
      "Z08"
    ]
  },
  {
    "eco": "Z09",
    "name": "Dracula–Frankenstein",
    "pgn": "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4",
    "ecos": [
      "Z09"
    ]
  },
  {
    "eco": "Z10",
    "name": "Bongcloud Counter-Gambit",
    "pgn": "1. e4 e5 2. Ke2 Ke7",
    "ecos": [
      "Z10"
    ]
  }
];
export default openings;
console.log('✅ openings:', openings.length);
