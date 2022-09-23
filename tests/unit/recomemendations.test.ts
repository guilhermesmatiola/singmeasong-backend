import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { CreateRecommendationFactory } from "../factories/recommendFactory";
import { Console } from "console";

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

	it("test create conflict", async () => {
		const recommendation = await CreateRecommendationFactory();

		jest.spyOn(recommendationRepository, "findByName").mockResolvedValueOnce({ id: 10, ...recommendation, score: 10 });

		const error = recommendationService.insert(recommendation);

		expect(error).rejects.toEqual({
			type: "conflict",
			message: "Recommendations names must be unique",
		});
	});

	it("test upvote service", async () => {

		const find = jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
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

	it("test upvote with invalid id", async () => {
		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		const id = 1;
		const error = recommendationService.upvote(id);

		expect(error).rejects.toEqual({ type: "not_found", message: "" });
	});

	it("test downvote service", async () => {

		const find = jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: 5,
			});

		const update = jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: 4,
			});

		const id = 1;
		await recommendationService.downvote(id);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
	});

	it("test downvote with invalid id", async () => {

		jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);

		const id = 1;
		const error = recommendationService.downvote(id);

		expect(error).rejects.toEqual({ type: "not_found", message: "" });
	});

	it("test if deletes with -5 downvoted", async () => {

		const find = jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: -5,
			});

		const update = jest.spyOn(recommendationRepository, "updateScore").mockResolvedValueOnce({
				id: 1,
				name: "teste",
				youtubeLink: "teste",
				score: -6,
			});

		const deleteRecommendation = jest.spyOn(recommendationRepository, "remove").mockImplementationOnce(async () => {});

		const ID = 1;
		await recommendationService.downvote(ID);

		expect(find).toHaveBeenCalled();
		expect(update).toHaveBeenCalled();
		expect(deleteRecommendation).toHaveBeenCalled();
	});

	it("test get all recommendations", async () => {

		const getAll = jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([]);

		const allRecommendations = await recommendationService.get();

		expect(getAll).toHaveBeenCalled();
		expect(allRecommendations).toBeInstanceOf(Array);
	});

	it("test get recommendations on top by decrescent amount", async () => {

		const recommendation = await CreateRecommendationFactory();

		const getByAmount = jest
			.spyOn(recommendationRepository, "getAmountByScore")
			.mockResolvedValueOnce([
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
				{ id: 1, name: "just a test", youtubeLink: "https://www.youtube.com/watch?v=G8kiL6BGmeQ", score: 10 },
			]);

		jest.spyOn(recommendationService, "getScoreFilter").mockReturnValue("gt");

		const getRandom = await recommendationService.getRandom();

		expect(getRecommendations).toHaveBeenCalled();
		expect(getRandom).toBeInstanceOf(Object);
	});

	it("test in get random recommendation type: 'lte'", async () => {

		const getRecommendations = jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce([
				{ id: 1, name: "teste", youtubeLink: "https://www.youtube.com/watch?v=G8kiL6BGmeQ", score: 10 },
			]);

		const getRandom = await recommendationService.getRandom();

		expect(getRecommendations).toHaveBeenCalled();
		expect(getRandom).toBeInstanceOf(Object);
	});

	it("test in fail case get random recommendation", async () => {
		jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

		const error = recommendationService.getRandom();

		expect(error).rejects.toEqual({ type: "not_found", message: "" });
	});
});