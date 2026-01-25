import { Difficulty, Exercise, MuscleGroup, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  exerciseDuration: 30,
  exercisesPerCycle: 10,
  cycleCount: 2,
  ttsVoiceURI: null,
};

export const SEED_EXERCISES: Exercise[] = [
  // НОГИ (LEGS)
  { 
    id: '1', 
    name: 'Jump Squat', 
    description: 'Взрывное приседание с максимальным прыжком вверх.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Поставьте ноги на ширине плеч.\n2. Опуститесь в классический присед, отводя таз назад.\n3. Из нижней точки мощно выпрыгните вверх, полностью выпрямляя тело.\n4. Мягко приземлитесь на согнутые колени и сразу переходите к следующему повторению.'
  },
  { 
    id: '2', 
    name: 'Bulgarian Split Squat', 
    description: 'Выпады с одной ногой на стуле.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте спиной к стулу или скамье.\n2. Положите одну ногу на сиденье (носком или подъемом стопы).\n3. Сделайте шаг вперед опорной ногой.\n4. Приседайте, пока бедро передней ноги не станет параллельно полу.\n5. Вернитесь в исходное положение, сохраняя спину прямой.'
  },
  { 
    id: '3', 
    name: 'Pistol Squat', 
    description: 'Приседание на одной ноге, вторая вытянута вперед.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Встаньте на одну ногу, вторую вытяните перед собой.\n2. Для баланса вытяните руки вперед.\n3. Медленно опускайтесь в глубокий присед на опорной ноге.\n4. Держите поднятую ногу прямой и не касайтесь ею пола.\n5. Мощным движением поднимитесь вверх.'
  },
  { 
    id: '4', 
    name: 'Lateral Lunge', 
    description: 'Широкий шаг в сторону с глубоким приседом на одну ногу.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте прямо, ноги вместе.\n2. Сделайте широкий шаг в сторону.\n3. Перенесите вес на отставленную ногу и присядьте на ней, держа вторую ногу прямой.\n4. Оттолкнитесь пяткой и вернитесь в исходное положение.'
  },
  { 
    id: '5', 
    name: 'Step Up', 
    description: 'Поочередный подъем на стул с акцентом на пятку.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Поставьте одну стопу полностью на устойчивый стул или возвышенность.\n2. Надавите пяткой на стул и поднимите тело вверх.\n3. Приставьте вторую ногу к первой на стуле.\n4. Медленно спуститесь вниз, начиная с той же ноги.'
  },
  { 
    id: '6', 
    name: 'Single Leg Glute Bridge', 
    description: 'Подъем таза лежа, одна нога поднята вертикально.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Лягте на спину, согните одну ногу в колене, стопа на полу.\n2. Вторую ногу вытяните вертикально вверх.\n3. Напрягите ягодицы и вытолкните таз максимально высоко.\n4. Сделайте паузу вверху и плавно опуститесь, не касаясь тазом пола.'
  },
  { 
    id: '7', 
    name: 'High Knees', 
    description: 'Бег на месте с максимальным подниманием колен к груди в быстром темпе.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Встаньте прямо, руки согнуты в локтях.\n2. Начните бег на месте, поднимая колени до уровня таза или выше.\n3. Активно работайте руками синхронно с ногами.\n4. Поддерживайте максимально возможный темп.'
  },
  { 
    id: '8', 
    name: 'Jumping Plie Squat', 
    description: 'Приседания с широкой постановкой стоп и прыжком.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Расставьте ноги широко, разверните носки в стороны (позиция плие).\n2. Присядьте, пока бедра не станут параллельны полу.\n3. Выпрыгните вверх, выпрямляя ноги.\n4. Мягко приземлитесь обратно в широкую стойку и сразу присядьте.'
  },
  { 
    id: '9', 
    name: 'Jumping Lunge', 
    description: 'Взрывные прыжки с переменой ног в воздухе.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Сделайте выпад вперед.\n2. Мощно подпрыгните вверх.\n3. В воздухе поменяйте ноги местами.\n4. Приземлитесь в выпад, где впереди оказалась другая нога.\n5. Следите, чтобы колено сзади стоящей ноги не билось о пол.'
  },
  { 
    id: '10', 
    name: 'Single Leg Calf Raise', 
    description: 'Проработка икроножных мышц стоя на одной ноге.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте на одну ногу (можно придерживаться за стену для баланса).\n2. Вторую ногу согните в колене или заведите за опорную.\n3. Медленно поднимитесь на носок опорной ноги максимально высоко.\n4. Задержитесь на секунду и плавно опустите пятку на пол.'
  },
  { 
    id: '11', 
    name: 'Wall Sit', 
    description: 'Статическое удержание полуприседа прижавшись к стене.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Прижмитесь спиной к стене.\n2. Сделайте шаг вперед и опуститесь вниз по стене, пока бедра не станут параллельны полу.\n3. Угол в коленях должен составлять 90 градусов.\n4. Удерживайте это положение, плотно прижимая поясницу к стене.'
  },
  { 
    id: '12', 
    name: 'Diagonal Lunge', 
    description: 'Выпад назад по диагонали (реверанс).', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте прямо, руки на поясе.\n2. Сделайте шаг назад и в сторону, заводя одну ногу за другую по диагонали.\n3. Опустите колено задней ноги почти до пола.\n4. Вернитесь в исходное положение за счет усилий передней ноги.'
  },
  { 
    id: '61', 
    name: 'Jumping Jack', 
    description: 'Кардио-упражнение: прыжки с одновременным разведением рук и ног в стороны.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Встаньте прямо, ноги вместе, руки вдоль туловища.\n2. В прыжке разведите ноги шире плеч и хлопните ладонями над головой.\n3. Следующим прыжком вернитесь в исходную позицию.\n4. Двигайтесь ритмично и без пауз.'
  },
  { 
    id: '62', 
    name: 'Lateral Drop And Touch', 
    description: 'Прыжок в сторону с последующим приседанием и касанием пола противоположной рукой.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Сделайте широкий прыжок в правую сторону.\n2. Приземлитесь на правую ногу в полуприсед.\n3. Коснитесь пола левой рукой перед собой.\n4. Сразу же сделайте прыжок влево и коснитесь пола правой рукой.'
  },
  { 
    id: '63', 
    name: 'Drop And Touch', 
    description: 'Прыжок на месте с приземлением в присед и касанием пола рукой.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Подпрыгните вверх на месте.\n2. В воздухе разведите ноги и приземлитесь в широкий присед.\n3. Коснитесь пола одной рукой в нижней точке.\n4. Вторым прыжком соберите ноги вместе и вернитесь в положение стоя.'
  },
  { 
    id: '64', 
    name: 'Skater', 
    description: 'Прыжки из стороны в сторону, имитирующие движения конькобежца.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сделайте прыжок в сторону на правую ногу.\n2. Левую ногу заведите назад за правую по диагонали, не касаясь ею пола.\n3. Слегка наклоните корпус вперед для баланса.\n4. Повторите прыжок в левую сторону, меняя опорную ногу.'
  },
  { 
    id: '65', 
    name: 'Lunge Touch And Kick', 
    description: 'Выпад вперед с касанием пола рукой, затем подъем и удар ногой вперед.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Сделайте глубокий выпад назад.\n2. Коснитесь пола рукой (со стороны задней ноги).\n3. Встаньте и этой же задней ногой нанесите резкий удар (кик) вперед.\n4. Снова вернитесь в выпад назад.'
  },
  { 
    id: '66', 
    name: 'Plyo Split Squat', 
    description: 'Взрывной сплит-присед с прыжком и сменой ног в воздухе.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Встаньте в положение выпада.\n2. Максимально сильно оттолкнитесь обеими ногами вверх.\n3. В верхней точке прыжка поменяйте ноги местами.\n4. Приземлитесь мягко в выпад и сразу продолжайте.'
  },
  { 
    id: '67', 
    name: 'Side To Side Hops', 
    description: 'Быстрые прыжки из стороны в сторону, удерживая ноги вместе.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Поставьте стопы вместе.\n2. Представьте невидимую линию на полу.\n3. Совершайте короткие и быстрые прыжки через эту линию вправо-влево.\n4. Работайте на передней части стопы, минимально касаясь пола пятками.'
  },
  { 
    id: '68', 
    name: 'Lunge And Rotation', 
    description: 'Выпад вперед с одновременным поворотом корпуса в сторону передней ноги.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Сделайте шаг вперед и опуститесь в выпад.\n2. Вытяните руки перед собой или держите их у груди.\n3. Плавно поверните корпус в сторону ноги, стоящей впереди.\n4. Верните корпус в центр и поднимитесь из выпада.'
  },
  { 
    id: '69', 
    name: 'One Leg Power Squat', 
    description: 'Приседание на одной ноге с последующим взрывным подъемом вверх.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Встаньте на одну ногу.\n2. Опуститесь в неглубокий присед на этой ноге.\n3. Взрывным усилием выпрямите ногу и подпрыгните вверх.\n4. Контролируйте колено, чтобы оно не заваливалось внутрь.'
  },
  { 
    id: '70', 
    name: 'One Leg Squat Hops', 
    description: 'Приседание на одной ноге с последующими небольшими прыжками вверх.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Примите положение полуприседа на одной ноге.\n2. Выполняйте серию небольших, частых прыжков на опорной ноге.\n3. Старайтесь не выпрямлять ногу полностью.\n4. Вторую ногу держите навесу.'
  },
  { 
    id: '71', 
    name: 'One Leg Squat Touch', 
    description: 'Приседание на одной ноге с касанием пола противоположной рукой.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Встаньте на правую ногу.\n2. Приседая на ней, наклонитесь вперед и коснитесь пола левой рукой.\n3. Держите спину ровной, а левую ногу вытянутой назад для баланса.\n4. Вернитесь в вертикальное положение.'
  },
  { 
    id: '72', 
    name: 'One Leg Wall Sit', 
    description: 'Статическое удержание полуприседа у стены на одной ноге.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Примите классическое положение Wall Sit (спина у стены, бедра параллельны полу).\n2. Оторвите одну ногу от пола и вытяните ее вперед.\n3. Удерживайте баланс и вес тела только на одной опорной ноге.\n4. Следите, чтобы таз не перекашивался.'
  },
  { 
    id: '73', 
    name: 'Power Squat', 
    description: 'Глубокий присед с акцентом на взрывной подъем вверх.', 
    muscleGroup: MuscleGroup.LEGS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Ноги чуть шире плеч.\n2. Медленно опуститесь в глубокий присед.\n3. Из нижней точки максимально быстро и мощно вытолкните тело вверх.\n4. В верхней точке напрягите ягодицы.'
  },

  // РУКИ (ARMS)
  { 
    id: '13', 
    name: 'Chair Dip', 
    description: 'Классическое упражнение на трицепс с опорой сзади.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сядьте на край стула, упритесь ладонями в сиденье рядом с бедрами.\n2. Вынесите ноги вперед и снимите таз со стула.\n3. Медленно согните локти до угла 90 градусов.\n4. Мощно выпрямите руки, поднимая себя обратно.'
  },
  { 
    id: '14', 
    name: 'Diamond Push-Up', 
    description: 'Отжимания с узкой постановкой рук (пальцы образуют ромб).', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Примите упор лежа.\n2. Соедините указательные и большие пальцы под грудью в форме ромба.\n3. Опускайте грудь к рукам, локти вдоль корпуса.\n4. Выжмите себя вверх, напрягая трицепсы.'
  },
  { 
    id: '15', 
    name: 'Plank To Elbow', 
    description: 'Смена положения из планки на прямых руках в планку на локтях.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Встаньте в планку на прямых руках.\n2. Опустите правую руку на локоть, затем левую.\n3. Верните правую руку на ладонь, затем левую.\n4. Держите корпус ровно.'
  },
  { 
    id: '16', 
    name: 'Shadow Boxing', 
    description: 'Интенсивные удары перед собой в высоком темпе.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Встаньте в боксерскую стойку.\n2. Наносите удары вперед по воображаемой цели.\n3. Полностью выпрямляйте руку и быстро возвращайте к лицу.\n4. Двигайтесь активно.'
  },
  { 
    id: '17', 
    name: 'Triceps Push-Up', 
    description: 'Локти прижаты к корпусу и смотрят строго назад.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Примите упор лежа, руки на ширине плеч.\n2. При спуске направляйте локти строго назад, вдоль корпуса.\n3. Коснитесь грудью пола.\n4. Вернитесь вверх.'
  },
  { 
    id: '18', 
    name: 'Plank Walk', 
    description: 'Перемещение в сторону в положении упор лежа.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте в планку на прямых руках.\n2. Одновременно переставьте правую руку и правую ногу в сторону.\n3. Приставьте левую сторону.\n4. Сделайте несколько шагов в одну сторону, затем в другую.'
  },
  { 
    id: '19', 
    name: 'Wall Curl', 
    description: 'Имитация подъема штанги за счет давления рук на стену.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Встаньте лицом к стене, прижмите к ней ладони пальцами вверх.\n2. Давите на стену, пытаясь "поднять" ее, напрягая бицепсы.\n3. Удерживайте напряжение 10 секунд.\n4. Расслабьтесь и повторите.'
  },
  { 
    id: '20', 
    name: 'Plank Up', 
    description: 'Из положения стоя наклон и «шаги» руками до упора лежа.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Встаньте прямо.\n2. Наклонитесь и поставьте ладони на пол.\n3. Переставляйте руки вперед до положения планки.\n4. "Шагайте" руками обратно к ногам и выпрямитесь.'
  },
  { 
    id: '21', 
    name: 'One Arm Push-Up', 
    description: 'Экстремальная нагрузка на трицепс и плечевой пояс.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Примите упор лежа, ноги расставьте широко.\n2. Одну руку уберите за спину.\n3. Медленно опуститесь вниз.\n4. Мощно выжмите себя вверх одной рукой.'
  },
  { 
    id: '22', 
    name: 'Push-Up Hold', 
    description: 'Зависание в нижней точке отжиманий на время.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Примите упор лежа.\n2. Опуститесь в нижнюю точку (грудь в паре сантиметров от пола).\n3. Зафиксируйте положение на максимально долгое время.\n4. Держите спину прямой.'
  },
  { 
    id: '23', 
    name: 'Arm Circles', 
    description: 'Изолирующая нагрузка на дельты в статико-динамике.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Разведите прямые руки в стороны параллельно полу.\n2. Выполняйте мелкие круговые движения.\n3. Сначала 30 секунд вперед, затем 30 секунд назад.\n4. Не опускайте руки.'
  },
  { 
    id: '24', 
    name: 'Plank Fist Raise', 
    description: 'Переход с ладоней на кулаки для укрепления кистей и рук.', 
    muscleGroup: MuscleGroup.ARMS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Встаньте в планку на ладонях.\n2. Перенесите вес на одну руку, вторую сожмите в кулак и поставьте.\n3. Повторите со второй рукой.\n4. Так же по очереди вернитесь на ладони.'
  },

  // ПРЕСС (ABS)
  { 
    id: '25', 
    name: 'Bicycle Crunch', 
    description: 'Поочередное касание локтем противоположного колена лежа.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, руки за головой.\n2. Подтяните правое колено к левому локтю, выпрямляя левую ногу.\n3. Смените сторону: левое колено к правому локтю.\n4. Двигайтесь ритмично.'
  },
  { 
    id: '26', 
    name: 'V-Up', 
    description: 'Одновременный подъем корпуса и прямых ног.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Лягте на спину, руки за головой.\n2. На выдохе одновременно поднимите прямые ноги и корпус.\n3. Постарайтесь коснуться руками стоп.\n4. Плавно опуститесь назад.'
  },
  { 
    id: '27', 
    name: 'Mountain Climber', 
    description: 'Подтягивание колен к груди в упоре лежа в быстром темпе.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Примите упор лежа.\n2. Быстро подтяните одно колено к груди.\n3. Верните ногу назад и сразу подтяните другую.\n4. Держите темп, не поднимая таз.'
  },
  { 
    id: '28', 
    name: 'Russian Twist', 
    description: 'Повороты корпуса сидя с оторванными от пола ногами.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сядьте на пол, отклонитесь назад, ноги оторвите от пола.\n2. Поворачивайте корпус вправо, касаясь пола руками.\n3. Затем повернитесь влево.\n4. Ноги должны оставаться неподвижными.'
  },
  { 
    id: '29', 
    name: 'Reverse Crunch', 
    description: 'Подъем таза вверх за счет мышц пресса лежа на спине.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, ноги согнуты.\n2. Напрягая пресс, поднимите таз и подтяните колени к лицу.\n3. Оторвите поясницу от пола.\n4. Медленно опустите таз обратно.'
  },
  { 
    id: '30', 
    name: 'Star Plank', 
    description: 'Планка с максимально широкой постановкой рук и ног.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Встаньте в планку на прямых руках.\n2. Раздвиньте руки и ноги максимально широко (в форме звезды).\n3. Удерживайте положение с ровной спиной.\n4. Напрягайте кор.'
  },
  { 
    id: '31', 
    name: 'Leg Raise', 
    description: 'Медленное опускание ног без касания пола.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, руки под ягодицами.\n2. Поднимите прямые ноги вверх на 90 градусов.\n3. Медленно опускайте их, не касаясь пола.\n4. Поднимите обратно.'
  },
  { 
    id: '32', 
    name: 'Side Plank Hip Lift', 
    description: 'Динамическая боковая планка для косых мышц.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте в боковую планку на локте.\n2. Опустите таз вниз до легкого касания пола.\n3. Мощно вытолкните таз вверх.\n4. Держите тело в одной линии.'
  },
  { 
    id: '33', 
    name: 'Dead Bug', 
    description: 'Контролируемое опускание разноименных руки и ноги.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Лягте на спину, руки и ноги подняты вверх (колени согнуты).\n2. Медленно опустите правую руку назад и левую ногу вперед.\n3. Верните в центр.\n4. Повторите для других сторон.'
  },
  { 
    id: '34', 
    name: 'L-Sit', 
    description: 'Удержание прямых ног на весу, опираясь руками на стул.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Упритесь ладонями в сиденье стула.\n2. Поднимите таз и выпрямите ноги перед собой параллельно полу.\n3. Удерживайте уголок максимально долго.\n4. Не сгибайте колени.'
  },
  { 
    id: '35', 
    name: 'Toe Touch Crunch', 
    description: 'Подъем лопаток к поднятым вертикально ногам.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, ноги подняты вертикально.\n2. Тянитесь руками к носкам, отрывая лопатки.\n3. Сделайте короткое скручивание вверху.\n4. Опуститесь.'
  },
  { 
    id: '36', 
    name: 'Burpee', 
    description: 'Комплексное упражнение с прыжком и упором лежа.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Из положения стоя присядьте, руки на пол.\n2. Прыжком перейдите в упор лежа.\n3. Прыжком вернитесь в присед.\n4. Выпрыгните вверх с хлопком.'
  },
  { 
    id: '79', 
    name: 'Abdominal Crunch', 
    description: 'Классическое упражнение для пресса: подъем верхней части тела из положения лежа.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, ноги согнуты.\n2. Руки за головой (не тяните шею!).\n3. На выдохе оторвите лопатки от пола.\n4. На вдохе медленно опуститесь.'
  },
  { 
    id: '80', 
    name: 'Full Side Plank', 
    description: 'Удержание тела в боковой планке на одной руке и ноге.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Встаньте в боковую планку на прямой руке.\n2. Вторая рука направлена вверх.\n3. Тело — ровная линия.\n4. Удерживайте статику.'
  },
  { 
    id: '81', 
    name: 'Plank', 
    description: 'Статическое упражнение: удержание тела в прямой линии на предплечьях и носках.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Упор на предплечья, локти под плечами.\n2. Ноги прямые, таз не поднят и не провален.\n3. Напрягите пресс и ягодицы.\n4. Смотрите в пол.'
  },
  { 
    id: '82', 
    name: 'Reverse Crunch And Hug', 
    description: 'Обратное скручивание с подтягиванием колен к груди и обхватом их руками.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сделайте обратное скручивание таза.\n2. В верхней точке обхватите колени руками.\n3. Плавно вернитесь в исходное положение.\n4. Не бросайте таз на пол.'
  },
  { 
    id: '83', 
    name: 'Reverse Plank', 
    description: 'Удержание тела в прямой линии лицом вверх, опираясь на руки и пятки.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сядьте, руки сзади.\n2. Опираясь на пятки, поднимите таз до прямой линии тела.\n3. Смотрите вверх.\n4. Удерживайте статику.'
  },
  { 
    id: '84', 
    name: 'Scissor Kicks', 
    description: 'Лежа на спине, попеременный подъем и опускание прямых ног, имитируя движение ножниц.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, ноги на весу (15 см от пола).\n2. Делайте вертикальные махи ногами по очереди.\n3. Пресс в постоянном напряжении.\n4. Поясница прижата к полу.'
  },
  { 
    id: '85', 
    name: 'Side Plank', 
    description: 'Удержание тела в боковой планке на предплечье и боковой части стопы.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Боковая планка на предплечье.\n2. Таз поднят.\n3. Держите равновесие.\n4. Свободная рука на бедре или вверху.'
  },
  { 
    id: '86', 
    name: 'Side Plank Crunch', 
    description: 'Боковая планка с подтягиванием верхнего колена к локтю.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Из боковой планки подтяните верхнее колено к локтю.\n2. Коснитесь и вернитесь в планку.\n3. Держите таз высоко.\n4. Повторите.'
  },
  { 
    id: '87', 
    name: 'V Sit Twist', 
    description: 'Удержание тела в положении V с поворотами корпуса из стороны в сторону.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Сядьте в позу V (баланс на копчике, ноги и корпус подняты).\n2. Поворачивайте корпус вправо и влево.\n3. Руки следуют за корпусом.\n4. Ноги старайтесь не раскачивать.'
  },
  { 
    id: '88', 
    name: 'Windscreen Wipers', 
    description: 'Лежа на спине, подъем ног и их движение из стороны в сторону, имитируя работу дворников.', 
    muscleGroup: MuscleGroup.ABS, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на спину, руки в стороны, ноги вертикально.\n2. Опускайте ноги вправо, затем влево.\n3. Лопатки прижаты к полу.\n4. Используйте силу косых мышц.'
  },

  // ГРУДЬ (CHEST)
  { 
    id: '37', 
    name: 'Wide Push-Up', 
    description: 'Отжимания с постановкой рук значительно шире плеч.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Поставьте руки в два раза шире плеч.\n2. Опускайтесь до касания грудью пола.\n3. Выжмите себя вверх.\n4. Локти направлены в стороны.'
  },
  { 
    id: '40', 
    name: 'Archer Push-Up', 
    description: 'Перенос веса на одну руку во время спуска.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Широкая постановка рук.\n2. При спуске сгибайте только одну руку, вторая остается прямой.\n3. Перенесите весь вес на согнутую руку.\n4. Вернитесь в центр и смените сторону.'
  },
  { 
    id: '38', 
    name: 'Chair Decline Push-Up', 
    description: 'Акцент на верхнюю часть грудных мышц.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Ноги на стуле, руки на полу.\n2. Тело — прямая линия.\n3. Опускайте грудь к полу.\n4. Выжмите себя вверх.'
  },
  { 
    id: '39', 
    name: 'Power Push-Up', 
    description: 'Отжимания с хлопком или отрывом ладоней от пола.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Опуститесь в отжимание.\n2. Резко толкнитесь вверх, чтобы ладони оторвались от пола.\n3. Сделайте хлопок (опционально).\n4. Мягко приземлитесь и повторите.'
  },
  { 
    id: '42', 
    name: 'Pause Push-Up', 
    description: 'Классика с задержкой на 3 секунды в нижней точке.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Опуститесь в нижнюю точку отжимания.\n2. Задержитесь на 3 секунды.\n3. Мощно вытолкните тело вверх.\n4. Повторите.'
  },
  { 
    id: '43', 
    name: 'Chair Push-Up', 
    description: 'Опора руками на сиденье стула.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Руки на краю стула.\n2. Корпус под углом к полу.\n3. Опускайте грудь к стулу.\n4. Выпрямите руки.'
  },
  { 
    id: '44', 
    name: 'Slow Negative Push-Up', 
    description: 'Максимальное время под нагрузкой в негативной фазе.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Опускайтесь из верхней точки максимально медленно (4-5 сек).\n2. Достигнув низа, быстро выжмите себя вверх.\n3. Держите кор напряженным.'
  },
  { 
    id: '45', 
    name: 'Offset Push-Up', 
    description: 'Одна рука впереди, другая сзади, смена через прыжок.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Одна рука выше уровня плеча, другая ниже.\n2. Отжимание.\n3. Прыжком на руках смените положение рук.\n4. Снова отжимание.'
  },
  { 
    id: '41', 
    name: 'Hindu Push-Up', 
    description: 'Волнообразное движение корпусом из «собаки мордой вниз».', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Поза "собака мордой вниз".\n2. Нырните грудью к полу.\n3. Вынырните в "собаку мордой вверх".\n4. Верните таз назад.'
  },
  { 
    id: '46', 
    name: 'Push-Up And Rotation', 
    description: 'Поворот корпуса в боковую планку после каждого отжимания.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сделайте отжимание.\n2. Вверху разверните корпус, поднимая одну руку в потолок.\n3. Вернитесь в упор лежа.\n4. Повторите в другую сторону.'
  },
  { 
    id: '47', 
    name: 'Chest Press', 
    description: 'Изометрическое сжатие ладоней перед грудью стоя.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Соедините ладони перед собой.\n2. Давите ими друг на друга максимально сильно.\n3. Удерживайте давление 15 секунд.\n4. Расслабьтесь.'
  },
  { 
    id: '48', 
    name: 'Spiderman Push-Up', 
    description: 'Подтягивание колена к локтю во время отжимания.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Опускайтесь вниз.\n2. Одновременно ведите колено к локтю с той же стороны.\n3. Верните ногу назад при подъеме.\n4. Повторите для другой стороны.'
  },
  { 
    id: '74', 
    name: 'Bird Dog Push-Up', 
    description: 'Отжимание с одновременным подъемом противоположной руки и ноги в верхней точке.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Сделайте отжимание.\n2. Вверху поднимите правую руку и левую ногу.\n3. Удержите баланс.\n4. Снова отжимание и смена сторон.'
  },
  { 
    id: '75', 
    name: 'Chair Pike Push-Up', 
    description: 'Отжимание в положении «пике» с ногами на стуле, акцент на плечи.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Ноги на стул, таз максимально вверх.\n2. Тело — буква L.\n3. Опускайте макушку к полу.\n4. Выжмите себя вверх.'
  },
  { 
    id: '76', 
    name: 'Grasshopper Push-Up', 
    description: 'Отжимание с приведением колена к противоположному локтю в нижней точке.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. В нижней точке отжимания пронесите колено под собой к другому локтю.\n2. Верните ногу.\n3. Поднимитесь.\n4. Повторите для другой ноги.'
  },
  { 
    id: '77', 
    name: 'One Leg Push-Up', 
    description: 'Отжимание с поднятой одной ногой для увеличения сложности.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.HARD, 
    biSided: true,
    steps: '1. Поднимите одну ногу.\n2. Выполняйте отжимания, не опуская ногу.\n3. Держите таз ровно.\n4. После сета смените ногу.'
  },
  { 
    id: '78', 
    name: 'Staggered Push-Up', 
    description: 'Отжимание с одной рукой впереди другой для смещения нагрузки.', 
    muscleGroup: MuscleGroup.CHEST, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Руки на разном уровне (одна выше, другая ниже).\n2. Выполните серию отжиманий.\n3. Поменяйте положение рук.\n4. Повторите серию.'
  },

  // СПИНА (BACK)
  { 
    id: '49', 
    name: 'Superman', 
    description: 'Одновременный подъем рук и ног лежа на животе.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на живот.\n2. Поднимите прямые руки и ноги вверх.\n3. Задержитесь на 2 секунды.\n4. Опуститесь.'
  },
  { 
    id: '50', 
    name: 'Boat Pose', 
    description: 'Удержание позы супермена с динамическим раскачиванием.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Поза Супермена (руки и ноги подняты).\n2. Начните раскачиваться на животе.\n3. Сохраняйте конечности прямыми.\n4. Не опускайте руки.'
  },
  { 
    id: '51', 
    name: 'Hyperextension', 
    description: 'Подъем только верхней части корпуса лежа на животе.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на живот, ноги прижаты к полу.\n2. Поднимите грудь максимально высоко.\n3. Плавно опуститесь.\n4. Руки за головой или у груди.'
  },
  { 
    id: '52', 
    name: 'Swimmer', 
    description: 'Поочередные махи разноименными руками и ногами лежа.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: true,
    steps: '1. Лягте на живот.\n2. Поочередно поднимайте правую руку/левую ногу и наоборот.\n3. Двигайтесь быстро.\n4. Взгляд в пол.'
  },
  { 
    id: '53', 
    name: 'W Raise', 
    description: 'Сведение лопаток лежа, руки образуют букву W.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на живот, руки согнуты (буква W).\n2. Поднимите локти и грудь.\n3. Максимально сведите лопатки.\n4. Опуститесь.'
  },
  { 
    id: '54', 
    name: 'Reverse Bridge', 
    description: 'Упор сзади на прямых руках, подъем таза до прямой линии.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Сидя, руки сзади, ноги согнуты.\n2. Поднимите таз до линии стола.\n3. Напрягите ягодицы и спину.\n4. Опуститесь.'
  },
  { 
    id: '55', 
    name: 'Table Pull-Up', 
    description: 'Горизонтальные подтягивания, используя край стола.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Лягте под стол.\n2. Хватитесь за край.\n3. Подтяните грудь к столешнице.\n4. Медленно опуститесь.'
  },
  { 
    id: '56', 
    name: 'Snow Angel', 
    description: 'Движение прямыми руками вдоль пола лежа на животе.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на живот, руки на весу.\n2. Опишите ими полукруг через стороны до головы.\n3. Верните к бедрам.\n4. Не касайтесь руками пола.'
  },
  { 
    id: '57', 
    name: 'Y Raise', 
    description: 'Подъем рук вперед-вверх в форме буквы Y лежа на животе.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Лягте на живот, руки в форме Y.\n2. Поднимите прямые руки вверх.\n3. Большие пальцы в потолок.\n4. Опуститесь.'
  },
  { 
    id: '58', 
    name: 'Bird Dog', 
    description: 'Подъем противоположных руки и ноги из планки.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Поза стола или планка.\n2. Поднимите правую руку и левую ногу.\n3. Держите баланс и ровную спину.\n4. Поменяйте стороны.'
  },
  { 
    id: '59', 
    name: 'Bent Over Fly', 
    description: 'Максимальное сжатие лопаток в наклоне корпуса.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.MEDIUM, 
    biSided: false,
    steps: '1. Наклон 45 градусов, спина прямая.\n2. Разведите руки в стороны через лопатки.\n3. Зажмите лопатки на секунду.\n4. Опустите руки.'
  },
  { 
    id: '60', 
    name: 'Back Widow', 
    description: 'Подъем грудной клетки лежа на спине с опорой на локти.', 
    muscleGroup: MuscleGroup.BACK, 
    difficulty: Difficulty.HARD, 
    biSided: false,
    steps: '1. Лежа на спине, локти в стороны упираются в пол.\n2. Давите локтями, поднимая грудь вверх.\n3. Спина отрывается от пола.\n4. Опуститесь.'
  }
];