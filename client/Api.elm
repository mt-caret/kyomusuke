module Api exposing (..)

import Json.Decode exposing (..)
import Dict exposing (Dict)

type alias Verdict =
  { ce : Int
  , wa : Int
  , tle : Int
  , mle : Int
  , ac : Int
  , olu : Int
  , re : Int
  , pe : Int
  }

initVerdict : Verdict
initVerdict = Verdict 0 0 0 0 0 0 0 0

sumVerdict : Verdict -> Int
sumVerdict v =  v.ce + v.wa + v.tle + v.mle + v.ac + v.olu + v.re + v.pe

sumNonAC : Verdict -> Int
sumNonAC v = (sumVerdict v) - v.ac

verdictList : List String
verdictList =
  [ "CE" -- Compile Error
  , "WA" -- Wrong Answer
  , "TLE" -- Time Limit Exceeded
  , "MLE" -- Memory Limit Exceeded
  , "AC" -- Accepted
  , "OLU" -- Output Limit Exceeded
  , "RE" -- Runtime Error
  , "PE" -- Presentation Error
  ]

verdictDecoder : Decoder Verdict
verdictDecoder =
  map8 Verdict
    (field "CE" int) -- Compile Error
    (field "WA" int) -- Wrong Answer
    (field "TLE" int) -- Time Limit Exceeded
    (field "MLE" int) -- Memory Limit Exceeded
    (field "AC" int) -- Accepted
    (field "OLU" int) -- Output Limit Exceeded
    (field "RE" int) -- Runtime Error
    (field "PE" int) -- Presentation Error

type alias VerdictSet = 
  { date : String
  , verdicts : Verdict
  }

verdictSetDecoder : Decoder VerdictSet
verdictSetDecoder =
    map2 VerdictSet (field "date" string) (field "verdicts" verdictDecoder)

type alias UserData =
  { userId : String
  , data : List VerdictSet
  }

userDataDecoder : Decoder UserData 
userDataDecoder =
    map2 UserData
        (field "userId" string)
        (field "data" (list verdictSetDecoder))

apiDecoder : Decoder (List UserData)
apiDecoder = list userDataDecoder

type alias Date =
  { year : Int
  , month : Int
  , day : Int
  }

dateToString : Date -> String
dateToString d =
  let
      yearStr = String.padLeft 4 '0' (toString d.year)
      monthStr = String.padLeft 2 '0' (toString d.month)
      dayStr = String.padLeft 2 '0' (toString d.day)
  in
      yearStr ++ "-" ++ monthStr ++ "-" ++ dayStr

startDate : Date
startDate = Date 2017 8 1

endDate : Date
endDate = Date 2017 9 1

dateRange : Date -> Date -> List Date
dateRange start end =
    let
        go s accum =
            if s == end then accum else go (incrementDate s) (accum ++ [ s ])
    in
        go start []


incrementDate : Date -> Date
incrementDate d =
    let
        newDay = d.day % 31 + 1
        newMonth = d.month + (if d.day == 31 then 1 else 0)
    in
        { d | month = newMonth, day = newDay } -- TODO: FIX! ONLY WORKS FOR AUGUST

type alias VerdictByUsers = Dict String Verdict
type alias VerdictData = Dict String VerdictByUsers

populateVerdictData : (List UserData) -> VerdictData
populateVerdictData userData =
    let
        f verdictData dict =
            List.foldl (\vset d -> g verdictData.userId vset d) dict verdictData.data -- VerdictSet (date, verdict)
        g user vset dict =
            let
                verdict = vset.verdicts
                upd mvbu =
                    case mvbu of
                        Nothing -> Just (Dict.fromList [(user, verdict)])
                        Just vbu -> Just (Dict.insert user verdict vbu)
            in
                Dict.update vset.date upd dict
    in
        List.foldl f Dict.empty userData
--  (a -> b -> b) -> b -> List a -> b
--  (UserData -> b -> b) -> b -> List UserData -> b
--  (UserData -> b -> b) -> (VerdictData) -> List UserData -> b

extractUsers : (List UserData) -> List String
extractUsers = List.map .userId

verdictDataDecoder : Decoder VerdictData
verdictDataDecoder = map populateVerdictData apiDecoder

queryVerdict : VerdictData -> Date -> String -> Verdict
queryVerdict vd date user =
    case Dict.get (dateToString date) vd of
        Nothing -> initVerdict
        Just vbu -> Maybe.withDefault initVerdict (Dict.get user vbu)
    

type alias AddUserResponse =
  { code : Maybe Int
  , status : String
  }

addUserResponseDecoder : Decoder AddUserResponse
addUserResponseDecoder =
    map2 AddUserResponse
        (field "code" (maybe int))
        (field "status" string)

userListDecoder : Decoder (List String)
userListDecoder = list string

