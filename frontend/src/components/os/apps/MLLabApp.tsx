export function MLLabApp() {
  const experiments = [
    { name: "heart-disease-xgb", dataset: "UCI Heart (303)", metric: "ROC-AUC", value: 0.921, progress: 100 },
    { name: "titanic-stack", dataset: "Kaggle Titanic (891)", metric: "Accuracy", value: 0.834, progress: 100 },
    { name: "calorie-burn-gbr", dataset: "Calories (15k)", metric: "MAE", value: 4.21, progress: 100 },
    { name: "phishing-url-bert", dataset: "PhishTank (180k)", metric: "F1", value: 0.967, progress: 72 },
  ];
  return (
    <div className="space-y-4 text-xs">
      <header>
        <h2 className="text-base font-semibold text-foreground">ML Lab</h2>
        <p className="text-muted-foreground">Active & completed model experiments</p>
      </header>
      <div className="space-y-2">
        {experiments.map((e) => (
          <div key={e.name} className="rounded-lg border border-border/60 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-foreground">{e.name}</div>
                <div className="text-[10px] text-muted-foreground">{e.dataset}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-cyan">{e.value}</div>
                <div className="text-[10px] text-muted-foreground">{e.metric}</div>
              </div>
            </div>
            <div className="mt-2 h-1 rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-purple"
                style={{ width: `${e.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
