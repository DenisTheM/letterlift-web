// src/data/occasionCopy.js
// ═══════════════════════════════════════════════════════
// Texte & Fragen pro Anlass
// Neuer Anlass? → Hier Block hinzufügen + in constants.js
// ═══════════════════════════════════════════════════════

const makeCopy = ({ contextQ, contextPh, goalPh, freqRec, memQ, memPh }) => ({
  contextQ, contextPh, goalPh, freqRec, memQ, memPh,
});

export const OCCASION_COPY = {
  tough_times: makeCopy({
    contextQ:  (n, s) => s ? "Was durchlebst du gerade?" : `Was durchlebt ${n} gerade?`,
    contextPh: (n, s) => s ? "z.B. Ich stecke seit Monaten in einem Tief..." : `z.B. ${n} hat sich getrennt und fühlt sich einsam...`,
    goalPh:    (n, s) => s ? "z.B. Wieder wissen, dass es weitergeht." : `z.B. Dass ${n} merkt, dass sie nicht allein ist.`,
    freqRec: "every3",
    memQ: [
      s => s ? "Gab es einen Moment, in dem du gemerkt hast: Ich bin stärker als ich dachte?" : "Was habt ihr gemeinsam durchgestanden?",
      s => s ? "Welcher Mensch hat dir in einer schweren Phase geholfen – und wie?" : "Gab es einen Moment, der eure Beziehung vertieft hat?",
      s => s ? "Welches Erlebnis gibt dir heute noch Kraft?" : "Was weiss nur ihr zwei – ein Geheimnis, ein Insider?",
    ],
    memPh: [
      s => s ? "z.B. Als ich die Kündigung bekam und trotzdem am nächsten Tag..." : "z.B. Als ihr Vater krank war, bin ich einfach hingefahren und wir haben die ganze Nacht geredet...",
      s => s ? "z.B. Mein Bruder hat mich damals einfach abgeholt und nichts gesagt..." : "z.B. Nach dem Streit letztes Jahr haben wir beide geweint und wussten: Das hier ist echt.",
      s => s ? "z.B. Die Wanderung am Bodensee, wo plötzlich alles klar wurde..." : "z.B. Unser Codewort wenn einer von uns Hilfe braucht...",
    ],
  }),

  motivation: makeCopy({
    contextQ:  (n, s) => s ? "Was ist dein Ziel?" : `Was ist ${n}s Ziel?`,
    contextPh: (n, s) => s ? "z.B. Ich trainiere für meinen ersten Marathon..." : `z.B. ${n} bereitet sich auf eine wichtige Prüfung vor...`,
    goalPh:    (n, s) => s ? "z.B. Dass ich am Start stehe und weiss: Ich bin bereit." : `z.B. Dass ${n} mit Selbstvertrauen in die Prüfung geht.`,
    freqRec: "daily",
    memQ: [
      s => s ? "Wann hast du zuletzt etwas geschafft, woran du gezweifelt hast?" : `Was hat ${s ? "dich" : "die Person"} schon bewiesen?`,
      s => s ? "Welcher Moment hat dich am meisten geprägt?" : "Welche gemeinsame Erinnerung zeigt ihre Stärke?",
      s => s ? "Gibt es einen Satz oder ein Erlebnis, das dich immer wieder motiviert?" : "Was würdest du ihr sagen, wenn sie aufgeben will?",
    ],
    memPh: [
      s => s ? "z.B. Letztes Jahr die Präsentation vor 200 Leuten – ich war so nervös, aber es lief..." : "z.B. Sie hat 3 Monate für die Prüfung gelernt und mit Bestnote bestanden...",
      s => s ? "z.B. Der Moment als ich alleine nach Japan gereist bin..." : "z.B. Wie sie beim Halbmarathon ab km 15 kämpfte aber durchhielt...",
      s => s ? "z.B. 'Du musst nicht perfekt sein, nur mutig.'" : "z.B. 'Erinnerst du dich, wie du damals...'",
    ],
  }),

  confidence: makeCopy({
    contextQ:  (n, s) => s ? "Wobei fehlt dir Selbstvertrauen?" : `Wobei fehlt ${n} Selbstvertrauen?`,
    contextPh: (n, s) => s ? "z.B. Neuer Job, fühle mich den Aufgaben nicht gewachsen..." : `z.B. ${n} hat sich beruflich verändert und zweifelt...`,
    goalPh:    (n, s) => s ? "z.B. An mich glauben." : `z.B. Dass ${n} ihre Stärken wieder sieht.`,
    freqRec: "every3",
    memQ: [
      s => s ? "Wann hast du dich zuletzt richtig kompetent gefühlt?" : "Wann hast du gesehen, wie sie über sich hinausgewachsen ist?",
      s => s ? "Wer glaubt an dich – und was hat diese Person gesagt?" : "Gibt es einen Moment, in dem du dachtest: Wow, das ist sie wirklich?",
      s => s ? "Welche Eigenschaft unterschätzt du an dir am meisten?" : "Was kann sie besser als sie selbst glaubt?",
    ],
    memPh: [
      s => s ? "z.B. Bei der Projektpräsentation, als alle danach klatschten..." : "z.B. Ihre Rede an der Hochzeit – alle hatten Gänsehaut...",
      s => s ? "z.B. Meine Chefin hat gesagt: 'Du bist besser als du denkst.'" : "z.B. Als sie ihren ersten Kunden coachte und er danach sagte...",
      s => s ? "z.B. Ich kann gut zuhören – das sagen alle, aber ich glaub es nie..." : "z.B. Ihre Geduld mit Kindern – sie merkt gar nicht wie besonders das ist...",
    ],
  }),

  appreciation: makeCopy({
    contextQ:  (n, s) => s ? "Wofür bist du dankbar?" : `Was schätzt du an ${n}?`,
    contextPh: (n, s) => s ? "z.B. Ich möchte mir bewusster machen, was gut läuft..." : `z.B. ${n} ist immer für alle da, bekommt aber selten Danke gesagt...`,
    goalPh:    (n, s) => s ? "z.B. Dankbarkeit und Zufriedenheit." : `z.B. Dass ${n} sich gesehen und wertgeschätzt fühlt.`,
    freqRec: "weekly",
    memQ: [
      s => s ? "Welcher Moment hat dir gezeigt, was wirklich wichtig ist?" : "Wann hat sie etwas getan, das du nie vergessen wirst?",
      s => s ? "Worüber lachst du heute noch?" : "Was ist euer Running Gag oder Insider-Witz?",
      s => s ? "Welche kleine Geste eines anderen Menschen hat dich berührt?" : "Was macht sie, ohne es zu merken, das anderen guttut?",
    ],
    memPh: [
      s => s ? "z.B. Als ich krank war und meine Nachbarin einfach Suppe gebracht hat..." : "z.B. Als ich umgezogen bin, stand sie morgens um 6 vor der Tür – ohne dass ich gefragt hatte...",
      s => s ? "z.B. Der verbrannte Kuchen an meinem 30. Geburtstag..." : "z.B. 'Das Ding mit dem Parkhaus in Italien' – wir müssen jedes Mal lachen...",
      s => s ? "z.B. Wie mein Vater jeden Sonntag frischen Zopf backt..." : "z.B. Sie merkt immer, wenn es jemandem nicht gut geht – bevor die Person es selbst weiss...",
    ],
  }),

  celebration: makeCopy({
    contextQ:  (n, s) => s ? "Was feierst du?" : "Was gibt es zu feiern?",
    contextPh: (n, s) => s ? "z.B. Ich werde 40 und möchte das bewusst erleben." : `z.B. ${n} hat einen Meilenstein erreicht.`,
    goalPh:    (n, s) => s ? "z.B. Mich selbst feiern." : `z.B. Dass ${n} merkt, wie weit sie gekommen ist.`,
    freqRec: "daily",
    memQ: [
      s => s ? "Was ist dein stolzester Moment der letzten Jahre?" : "Was hat sie auf dem Weg dorthin erlebt?",
      s => s ? "Welcher Mensch hat diesen Erfolg mitermöglicht?" : "Welche lustige Geschichte verbindet ihr?",
      s => s ? "Was hat dich der Weg dorthin gelehrt?" : "Was würdest du ihr über den Weg sagen, den sie gegangen ist?",
    ],
    memPh: [
      s => s ? "z.B. Den Job zu kündigen und mein eigenes Ding zu starten..." : "z.B. Die ersten Monate in der neuen Stadt, als alles unsicher war...",
      s => s ? "z.B. Ohne meinen Bruder hätte ich den Mut nie gehabt..." : "z.B. Der Abend vor der Prüfung, als wir Pizza bestellt und gelacht haben...",
      s => s ? "z.B. Dass es okay ist, Angst zu haben und trotzdem zu springen..." : "z.B. 'Du hast so oft gezweifelt – und schau wo du jetzt stehst.'",
    ],
  }),

  growth: makeCopy({
    contextQ:  (n, s) => s ? "Woran arbeitest du gerade?" : `Woran arbeitet ${n}?`,
    contextPh: (n, s) => s ? "z.B. Achtsamer leben, weniger Autopilot..." : `z.B. ${n} ist in einer Umbruchphase...`,
    goalPh:    (n, s) => s ? "z.B. Klarer wissen was ich will." : `z.B. Dass ${n} Klarheit gewinnt.`,
    freqRec: "every3",
    memQ: [
      s => s ? "Welcher Wendepunkt hat dich verändert?" : "Was hat sie zuletzt verändert oder losgelassen?",
      s => s ? "Welche Gewohnheit oder Erkenntnis hat einen Unterschied gemacht?" : "Wie hat sich eure Beziehung über die Zeit verändert?",
      s => s ? "Wo willst du in einem Jahr stehen?" : "Was siehst du in ihr, das sie vielleicht noch nicht sieht?",
    ],
    memPh: [
      s => s ? "z.B. Der Moment, als ich gemerkt habe: Ich muss nicht allen gefallen..." : "z.B. Als sie den toxischen Job gekündigt hat – obwohl alle dagegen waren...",
      s => s ? "z.B. Jeden Morgen 10 Minuten Stille – klingt banal, hat alles verändert..." : "z.B. Früher war sie immer die Stille – heute steht sie für sich ein...",
      s => s ? "z.B. Weniger Perfektion, mehr Mut zum Unperfekten..." : "z.B. Wie ruhig und klar sie geworden ist – das ist ihr gar nicht bewusst...",
    ],
  }),
};

export const DEFAULT_COPY = {
  contextQ:  (n, s) => s ? "Was beschäftigt dich?" : `Erzähl uns von ${n}`,
  contextPh: () => "",
  goalPh:    () => "",
  freqRec: "every3",
  memQ: [
    s => s ? "Beschreibe einen besonderen Moment." : "Was habt ihr zusammen erlebt, worüber ihr heute noch redet?",
    s => s ? "Was hat dich geprägt?" : "Gibt es eine Geschichte, die nur ihr zwei kennt?",
    s => s ? "Was gibt dir Kraft?" : "Was ist typisch für sie – eine Macke, ein Ritual, ein Spruch?",
  ],
  memPh: [
    s => s ? "z.B. Der Tag, an dem alles anders wurde..." : "z.B. Die Reise nach Lissabon, als wir...",
    s => s ? "z.B. Ein Gespräch, das mich verändert hat..." : "z.B. Unser Ritual jeden Freitagabend...",
    s => s ? "z.B. Wenn ich an diesen Ort denke, spüre ich..." : "z.B. Sie sagt immer '...' – das bringt mich jedes Mal zum Lachen...",
  ],
};

/** Hilfsfunktion: Copy für Anlass holen (mit Fallback) */
export const getOccasionCopy = (occasionId) =>
  OCCASION_COPY[occasionId] || DEFAULT_COPY;
