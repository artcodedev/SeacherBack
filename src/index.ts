

/*
 *** Main
*/
import express, { Express, Request, Response } from "express";
import bodyParser from 'body-parser';
import cors from 'cors';

/*
 *** Utils
*/
import { Console } from "./Utils/Console";
import { Token } from "./Utils/Token";
import { SecretKey } from "./Secure/SecretKey";

/*
 *** Models
*/
import { Data, GLOBAL_BD, GLOBAL_BD_data, MoveData, SearchData, SelectedData, Token_t, OffsetData } from './Models/Models'

/*
 *** Json data
*/
import profile from './DATA/profile.json';

const app: Express = express();
const port: number = 3001;

app.use((cors as (options: cors.CorsOptions) => express.RequestHandler)({}));
app.use(bodyParser.json());

/*
*** Global database
*/
const G_BD: GLOBAL_BD = {
    data: []
}

/*
*** Set data for users
*/
class DataUsersId {

    public static getData(): Data[] {

        const data: Data[] = [];

        for (let i = 0; i < 1000001; i++) {
            data.push({
                id: i,
                name: 'test name',
                age: 20
            })
        }

        return  data;

    }
}

/*
*** Global data (fake DB)
*/
const DATA: {data: Data[]} = {
    data: DataUsersId.getData()
}

/*
*** All utils class
*/
class FounterDB {

    public static async getDataTokenIndex(token: string): Promise<number | null> {

        for (let i = 0; i < G_BD.data.length; i++) {

            console.log(G_BD.data[i].token)

            if (G_BD.data[i].token === token) return i;
        }

        return null;
    }
}

/*
*** All controllers
*/
class GetTokenData {

    /*
      *** Get Random number
    */
    private static getRandomArbitrary(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /*
      *** Get token and data
    */
    public static async getTokenData(req: Request, res: Response): Promise<void> {
        try {

            const random: number = GetTokenData.getRandomArbitrary(100000, 99999999999);

            const token_t: Token_t = {
                num: random,
                date: Date.now()
            }

            const token: string = await Token.sign(token_t, SecretKey.secret_key, 1000000000000)

            const new_data: GLOBAL_BD_data = {
                token: token,
                profile: profile,
                data: DATA.data
            }

            G_BD.data.push(new_data);

            res.status(200).json({
                token: token,
                profile: profile,
                data: DATA.data.slice(0, 20)
            });

        } catch (error) {
            res.status(500).json({ error: "Error in server" });
        }
    }
}

class GetData {

    /*
      *** Get data use token
    */
    public static async getData(req: Request, res: Response): Promise<void> {
        try {

            const data: { token: string } = req.body;

            if (data) {
                const index = await FounterDB.getDataTokenIndex(data.token);

                if (index != null) {

                    res.status(200).json({
                        token: G_BD.data[index].token,
                        profile: G_BD.data[index].profile,
                        data: G_BD.data[index].data.slice(0, 20)
                    });
                }

                res.status(500).json({ error: "can not found data in db" });
            }

            res.status(500).json({ error: "token is not found" });

        }
        catch (error) {
            res.status(500).json({ error: "Error in server" });
        }
    }
}

class Index {

    /*
      *** Index page
    */
    public static async getIndex(req: Request, res: Response): Promise<void> {

        try {

            res.status(200).json({ message: 'Index page' });

        } catch (error) {

            res.status(500).json({ error: "Error in server" });
        }
    }
}

class Sorted {

    public static async setSorted(req: Request, res: Response): Promise<void> {

        try {

            const data: { token: string, sorted: number } = req.body;

            if (data) {

                const index = await FounterDB.getDataTokenIndex(data.token);

                if (index != null) {

                    const sorted_elems: Data[] = G_BD.data[index].data.sort((x, y) => x.id - y.id);

                    G_BD.data[index].data = data.sorted ? sorted_elems.reverse() : sorted_elems;

                    console.log(G_BD.data[index].profile.selected)

                    res.status(200).json({ error: "Set sorted is update" });
                }

                res.status(500).json({ error: "Can not found data in db" });
            }

            res.status(500).json({ error: "Set sorted is not update" });
        }
        catch (error) {
            res.status(500).json({ error: "Error in server" });
        }
    }
}

class Move {

    private static async moveElementInArray(arr: Data[], fromIndex: number, toIndex: number): Promise<Data[]> {

        const element: Data = arr.splice(fromIndex, 1)[0];

        arr.splice(toIndex, 0, element);

        return arr;
    }

    public static async setMove(req: Request, res: Response): Promise<void> {

        try {

            const data: MoveData = req.body;

            if (data) {

                const index = await FounterDB.getDataTokenIndex(data.token);

                if (index != null) {

                    const new_data: Data[] = await Move.moveElementInArray(G_BD.data[index].data, data.draggingRow, data.hoveredRow);

                    G_BD.data[index].data = new_data;

                    res.status(200).json({ message: "Set move is update" });
                }

                res.status(500).json({ error: "Can not found data in db" });

            }

            res.status(500).json({ error: "Set move is not update" });
        }
        catch (error) {
            res.status(500).json({ error: "Error in server" });
        }
    }
}

class Search {

    public static async search(req: Request, res: Response): Promise<void> {

        try {

            const data: SearchData = req.body;

            if (data) {

                const index = await FounterDB.getDataTokenIndex(data.token);

                let data_search: Data[] = [];

                if (index != null) {

                    if (data.query != null) {

                        for (let i = 0; i < DATA.data.length; i++) {

                            const sr: Data = DATA.data[i];

                            if (sr.id.toString().indexOf(data.query.toString()) != -1) data_search.push(sr);

                        }
                    } else { data_search = DATA.data; }

                    G_BD.data[index].profile.search = data.query;
                    G_BD.data[index].data = data_search;

                    res.status(200).json({
                        token: data.token,
                        profile: G_BD.data[index].profile,
                        data: G_BD.data[index].data.slice(0, 20)
                    });

                }

                res.status(500).json({ error: "can not found data in db" });

            }

            res.status(500).json({ error: "Set search is not update" });

        }

        catch (error) {
            res.status(500).json({ error: "Error in server" });
        }

    }
}

class Selected {

    public static async setSelected(req: Request, res: Response): Promise<void> {
        try {

            const data: SelectedData = req.body;

            if (data) {

                const index = await FounterDB.getDataTokenIndex(data.token);

                if (index != null) {

                    const db_selected: string[]= G_BD.data[index].profile.selected;

                    if (db_selected.includes(data.selected)) {

                        for (let i = 0; i < db_selected.length; i++) {

                            if (db_selected[i] === data.selected) {

                                db_selected.splice(i, 1);

                                break

                            }
                        }
                    } else {db_selected.push(data.selected);}

                    G_BD.data[index].profile.selected = db_selected;

                    res.status(200).json({ db_selected: db_selected });

                }

                res.status(500).json({ error: "can not found data in db" });

            }

            res.status(500).json({ error: "Set selected is not update" });

        }
        catch (error) {
            res.status(500).json({ error: "Error in server" });
        }
    }
}

class Offset {

    public static async getOffsetData(req: Request, res: Response): Promise<void> {

        try {
            const data: OffsetData = req.body;

            console.log(data)

            if (data) {

                const index = await FounterDB.getDataTokenIndex(data.token);

                if (index != null) {

                    res.status(200).json({
                        data: G_BD.data[index].data.slice(data.offset, data.offset + 20)
                    });

                }

                res.status(500).json({ error: "can not found data in db" });

            }

            res.status(500).json({ error: "Set selected is not update" });
        }

        catch (error) {
            res.status(500).json({ error: "Error in server" });
        }
    }
}

class Test {

    public static async test(req: Request, res: Response): Promise<void> {
        res.status(200).json({ data: G_BD.data });
    }
}

// Test token for work
const start_data = () => {
    const new_data: GLOBAL_BD_data = {
        token: '11111',
        profile: profile,
        data: DATA.data
    }

    G_BD.data.push(new_data);
}

// after delete or not
start_data();

export default Index;

/*
*** All routers
*/
app.get("/", Index.getIndex);

app.post('/api/v1/get_token_data', GetTokenData.getTokenData)

app.post('/api/v1/get_data', GetData.getData)

app.post('/api/v1/set_sorted', Sorted.setSorted)

app.post('/api/v1/set_move', Move.setMove)

app.post('/api/v1/get_search', Search.search)

app.post('/api/v1/get_selected', Selected.setSelected)

app.post('/api/v1/get_offset_data', Offset.getOffsetData)

app.get('/api/v1/test', Test.test)


app.listen(port, () => Console.log(`Server running on port ${port}`));




