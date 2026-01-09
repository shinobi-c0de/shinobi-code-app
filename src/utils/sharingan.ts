import Sharingan from "../assets/images/sharingan/sharingan_1.png";
import Itachi1 from "../assets/images/sharingan/sharingan_3.png";
import Itachi2 from "../assets/images/sharingan/sharingan_2.png";
import Kakashi from "../assets/images/sharingan/sharingan_1.png";
import Izanami from "../assets/images/sharingan/sharingan_1.png";
import Madara from "../assets/images/sharingan/sharingan_6.png";
import Sasuke from "../assets/images/sharingan/sharingan_7.png";
import Obito from "../assets/images/sharingan/sharingan_4.png";

const eyeImage = new Image();
eyeImage.src = Sharingan;

const sharingan = {
    sharingan: Sharingan,
    genjutsu: Itachi1,
    izanagi: Itachi2,
    "kakashi of the sharingan": Kakashi,
    izanami: Izanami,
    susanoo: Madara,
    amaterasu: Sasuke,
    kamui: Obito,
};
type Sharingan = keyof typeof sharingan;

export const sharingan_keys = Object.keys(sharingan);

export function mapSharingan(jutsu: string) {
    if (sharingan_keys.includes(jutsu)) {
        eyeImage.src = sharingan[jutsu as Sharingan];
    }
    return eyeImage;
}