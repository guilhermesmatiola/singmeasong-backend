import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { CreateRecommendationFactory } from "../factories/recommendFactory";
import { Console } from "console";
import {faker} from "@faker-js/faker";
import { recommendationData } from "./factories/recommendationsFactory";
import { conflictError } from "../../src/utils/errorUtils.js";


beforeEach(async () => {
	jest.resetAllMocks();
	jest.clearAllMocks();
});

describe("Testing recommendation service - Unit tests", () => {

	it("test create", async () => {
		const find = jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce(() => {
			return null;
		});

		const created = jest.spyOn(recommendationRepository, "create").mockImplementationOnce(async () => {});
		const recommendation = await CreateRecommendationFactory();

		await recommendationService.insert(recommendation);

		expect(Console).not.toBe("Recommendations names must be unique");
		expect(find).toHaveBeenCalled();
		expect(created).toHaveBeenCalled();
	});

	it("test create conflict: should answer with status 409", async () => {
		const recommendation = recommendationData(0);

		jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce(recommendation);

		expect(async () => {
			await recommendationService.insert(recommendation);
		}).rejects.toEqual(conflictError("Recommendations names must be unique"));
	});

	it("test upvote service", async () => {

		const find = jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce({
			id: 1,
			name: faker.lorem.words(),
			youtubeLink: "https://www.youtube.com/watch?v=hjz6-opHCBc",
			score: 11,
		});

		const update = jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce(() => {
			return null;
		});

		const id = 1;
		await recommendationService.upvote(id);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
	});

	it("test upvote with invalid: should answer with throw - not_found", async () => {
		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		expect(async () => {
			await recommendationService.upvote(3);
		}).rejects.toEqual({
			message: "",
			type: "not_found",
		});
	});

	it("test downvote service", async () => {

		const find = jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce({
			id: 1,
			name: faker.lorem.words(),
			youtubeLink: "https://www.youtube.com/watch?v=hjz6-opHCBc",
			score: 5,
		});

		const update = jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce({
			id: 1,
			name: faker.lorem.words(),
			youtubeLink: "https://www.youtube.com/watch?v=hjz6-opHCBc",
			score: 4,
		});

		const id = 1;
		await recommendationService.downvote(id);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
	});

	it("test downvote with invalid: should answer with throw - not_found", async () => {
		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		expect(async () => {
			await recommendationService.downvote(3);
		}).rejects.toEqual({
			message: "",
			type: "not_found",
		});
	});

	it("test if deletes with -5 downvoted: should called function remove recommendation", async () => {
		const recommendation = recommendationData(-6);

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(recommendation);
		jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce(recommendation);

		const remove = jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(null);

		await recommendationService.downvote(434);

		expect(remove).toBeCalled();
	});

	it("test get all recommendations", async () => {

		const getAll = jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);

		const allRecommendations = await recommendationService.get();

		expect(getAll).toHaveBeenCalled();
		expect(allRecommendations).toBeInstanceOf(Array);
	});

	it("test get recommendations on top by decrescent amount", async () => {

		const recommendation = await CreateRecommendationFactory();

		const getByAmount = jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce([
			{ id: 1, ...recommendation, score: 3 },
			{ id: 2, ...recommendation, score: 2 },
			{ id: 3, ...recommendation, score: 1 },
		]);

		const amount = 3;
		const topRecommendations = await recommendationService.getTop(amount);

		expect(getByAmount).toHaveBeenCalled();
		expect(topRecommendations.length).toBe(amount);
		expect(topRecommendations).toBeInstanceOf(Array);
		expect(topRecommendations[0].score).toBeGreaterThan(topRecommendations[1].score);
	});

	it("test in score filter type: 'gt'", async () => {

		const random = 0.5;
		const filter = recommendationService.getScoreFilter(random);

		expect(filter).toBe("gt");
	});

	it("test in score filter type: 'lte'", async () => {

		const random = 0.8;
		const filter = recommendationService.getScoreFilter(random);

		expect(filter).toBe("lte");
	});
	
	it("test in get random recommendation type: 'gt'", async () => {

		const getRecommendations = jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([
			{ id: 1, name: faker.lorem.words(), youtubeLink: "https://www.youtube.com/watch?v=G8kiL6BGmeQ", score: Number(faker.random.numeric(3)) },
		]);

		jest.spyOn(recommendationService, "getScoreFilter").mockReturnValue("gt");

		const getRandom = await recommendationService.getRandom();

		expect(getRecommendations).toHaveBeenCalled();
		expect(getRandom).toBeInstanceOf(Object);
	});

	it("test in get random recommendation type: 'lte'", async () => {

		const getRecommendations = jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([
			{ id: 1, name: faker.lorem.words(), youtubeLink: "https://www.youtube.com/watch?v=G8kiL6BGmeQ", score: Number(faker.random.numeric(3)) },
		]);

		const getRandom = await recommendationService.getRandom();

		expect(getRecommendations).toHaveBeenCalled();
		expect(getRandom).toBeInstanceOf(Object);
	});

	it("test in fail case get random recommendation: should answer with throw error - not_found", async () => {
		const random = 0.6;

		jest.spyOn(global.Math, "random").mockReturnValue(random);
		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);
		jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);

		expect(async () => {
			await recommendationService.getRandom();
		}).rejects.toEqual({
			message: "",
			type: "not_found",
		});
	});

});
