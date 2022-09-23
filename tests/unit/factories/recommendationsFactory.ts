import { Recommendation } from "@prisma/client";

export function recommendationData(score: number): Recommendation {
    return {
        id: 434,
        name: "Teste",
        youtubeLink: "https://www.youtube.com/watch?v=hjz6-opHCBc",
        score,
    };
}
