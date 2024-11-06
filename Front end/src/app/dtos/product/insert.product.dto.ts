import {
    IsString, 
    IsNotEmpty, 
    IsPhoneNumber,     
} from 'class-validator';

export class InsertProductDTO {
    @IsPhoneNumber()
    name: string;

    price: number;
    thumbnail: string ;

    @IsString()
    @IsNotEmpty()
    description: string;

    category_id: number;

    images: File[] = [];
    
    constructor(data: any) {
        this.name = data.name;
        this.price = data.price;
        this.thumbnail= data.thumbnail;
        this.description = data.description;
        this.category_id = data.category_id;
    }
}