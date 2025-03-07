import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

export class Token {

    /*
    *** Token sign
    */
    public static async sign(object: any, key: string, exp: number): Promise<string> {

        return jsonwebtoken.sign( object, key, { expiresIn: exp} );
    }

    /*
    *** Token verify
    */
    public static async verify(token: string, key: string): Promise<boolean> {
        try {

            const varify: string | JwtPayload = jsonwebtoken.verify(token, key);
            return varify ? true : false;

        } catch (e) {

            return false
        }
    }


}