import { faker } from "@faker-js/faker";

export async function CreateRecommendationFactory(){

	return{
		name: faker.lorem.words(),
		youtubeLink: "https://www.youtube.com/watch?v=17ozSeGw-fY"
	};
    
}